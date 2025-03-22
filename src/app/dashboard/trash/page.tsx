import React from "react";
import FileBrowser from "../_components/file-browser";

const page = () => {
  return (
    <div>
      <FileBrowser title="Trash" deletedOnly />
    </div>
  );
};

export default page;
