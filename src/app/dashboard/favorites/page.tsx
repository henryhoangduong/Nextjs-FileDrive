import React from "react";
import FileBrowser from "../_components/file-browser";

const page = () => {
  return (
    <div>
      <FileBrowser title="Your Favorites" favoriteOnly />
    </div>
  );
};

export default page;
