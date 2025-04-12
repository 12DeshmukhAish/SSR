// New file or integrated logic module: `revisionDuplicateUtils.js`

export const prefillRevisionDuplicateLocalStorage = (record, sub) => {
    const oldRevNo = parseFloat(sub.reviseNumber);
    const newRevNo = (oldRevNo + 0.1).toFixed(1);
  
    localStorage.setItem("editMode", "true");
    localStorage.setItem("recordId", record.id);
    localStorage.setItem("reviseId", "");
    localStorage.setItem("reviseno", newRevNo);
    localStorage.setItem("duplicateRevision", "true");
    localStorage.setItem("revisionOnlyViewMode", "true");
  
    localStorage.setItem("edit_nameOfWork", record.nameOfWork);
    localStorage.setItem("edit_state", record.state);
    localStorage.setItem("edit_department", record.department);
    localStorage.setItem("edit_ssr", record.ssr);
    localStorage.setItem("edit_area", record.area);
    localStorage.setItem("edit_preparedBy", record.preparedBySignature);
    localStorage.setItem("edit_checkedBy", record.checkedBySignature);
    localStorage.setItem("edit_chapter", record.chapterId?.toString());
  
    localStorage.setItem("autogenerated", record.workOrderID);
    localStorage.setItem("status", record.status);
    localStorage.setItem("revisionStage", "started");
  };
  
  export const isRevisionViewMode = () => localStorage.getItem("revisionOnlyViewMode") === "true";
  