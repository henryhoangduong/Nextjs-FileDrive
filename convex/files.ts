import { MutationCtx } from "./_generated/server.d";
import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .first();
  if (!user) {
    return null;
  }
  const hasAccess =
    user.orgIds.some((item) => item.orgId === orgId) ||
    user?.tokenIdentifier.includes(orgId);
  if (!hasAccess) {
    return null;
  }
  return { user };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const hasAccess = hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      throw new ConvexError("you dont have access to this org");
    }

    await ctx.db.insert("files", {
      name: args.name,
      fileId: args.fileId,
      orgId: args.orgId,
      type: args.type,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      return [];
    }
    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const query = args.query;
    if (query) {
      return files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase()),
      );
    }
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId),
      )
      .collect();
    if (args.favorites) {
      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId == file._id),
      );
    }
    if (args.deletedOnly) {
      files = files.filter((file) => file.shouldDelete);
    } else{
      files = files.filter((file)=> !file.shouldDelete )
    }
    return files;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAcessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("No access to file");
    }
    const isAdmin =
      access.user.orgIds.find((org) => org.orgId == access.file.orgId)?.role ==
      "admin";
    if (!isAdmin) {
      throw new ConvexError("You dont have admin access to this file");
    }
    await ctx.db.patch(args.fileId, {
      shouldDelete: true,
    });
  },
});

async function hasAcessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">,
) {
  const file = await ctx.db.get(fileId);
  if (!file) {
    return null;
  }
  const hasAccess = await hasAccessToOrg(ctx, file.orgId);
  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}

export const toggleFavorie = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const access = await hasAcessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("no access to file");
    }
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access?.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id),
      )
      .first();
    if (!favorite) {
      await ctx.db.insert("favorites", {
        orgId: access.file.orgId,
        userId: access.user._id,
        fileId: args.fileId,
      });
    }
  },
});

export const getAllFavorites = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      return [];
    }
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAccess.user._id),
      )
      .collect();
    return favorites;
  },
});
