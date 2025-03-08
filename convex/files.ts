import { MutationCtx } from "./_generated/server.d";
import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string,
) {
  const user = await getUser(ctx, tokenIdentifier);
  const hasAccess =
    user?.orgIds.includes(orgId) || user?.tokenIdentifier.includes(orgId);
  if (!hasAccess) {
    throw new ConvexError("you dont have access to this org");
  }
  return hasAccess;
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("you must be logged in to upload a file");
    }
    const hasAccess = hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId);
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
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("you dont have access to this org");
    }
    return ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const deleteFile = mutation({
  args: { filedId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("you must be logged in to upload a file");
    }
    const file = await ctx.db.get(args.filedId);
    if (!file) {
      throw new ConvexError("This file does not exist");
    }
    const hasAccess = hasAccessToOrg(ctx, identity.tokenIdentifier, file.orgId);
    if (!hasAccess) {
      throw new ConvexError("you dont have access to delete this file");
    }
    await ctx.db.delete(args.filedId);
  },
});
