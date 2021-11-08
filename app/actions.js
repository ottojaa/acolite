"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileActionResponses = exports.FileActions = exports.FolderActionResponses = exports.FolderActions = void 0;
var FolderActions;
(function (FolderActions) {
    FolderActions["ChooseDir"] = "choose-directory";
    FolderActions["SetDefaultDir"] = "set-default-directory";
    FolderActions["MkDir"] = "make-directory";
    FolderActions["ReadDir"] = "read-directory";
})(FolderActions = exports.FolderActions || (exports.FolderActions = {}));
var FolderActionResponses;
(function (FolderActionResponses) {
    FolderActionResponses["ReadDirectorySuccess"] = "read-directory-success";
    FolderActionResponses["ReadDirectoryFailure"] = "read-directory-failure";
    FolderActionResponses["MakeDirectorySuccess"] = "make-directory-success";
    FolderActionResponses["MakeDirectoryFailure"] = "make-directory-failure";
    FolderActionResponses["SetDefaultDirSuccess"] = "set-default-directory-success";
    FolderActionResponses["SetDefaultDirFailure"] = "set-default-directory-failure";
    FolderActionResponses["ChooseDirectorySuccess"] = "choose-directory-success";
    FolderActionResponses["ChooseDirectoryCanceled"] = "choose-directory-canceled";
    FolderActionResponses["ChooseDirectoryFailure"] = "choose-directory-failure";
})(FolderActionResponses = exports.FolderActionResponses || (exports.FolderActionResponses = {}));
var FileActions;
(function (FileActions) {
    FileActions["Create"] = "create-file";
    FileActions["Rename"] = "rename-file";
    FileActions["Delete"] = "delete";
    FileActions["Paste"] = "paste-file";
    FileActions["Copy"] = "copy-file";
    FileActions["Cut"] = "cut-file";
    FileActions["Update"] = "update-file";
    FileActions["OpenInFolder"] = "open-file-in-folder";
    FileActions["ModifyTags"] = "modify-tags";
    FileActions["DeleteFiles"] = "delete-files";
    FileActions["MoveFiles"] = "move-files";
    FileActions["ReadFile"] = "read-file";
})(FileActions = exports.FileActions || (exports.FileActions = {}));
var FileActionResponses;
(function (FileActionResponses) {
    FileActionResponses["CreateSuccess"] = "create-file-success";
    FileActionResponses["CreateFailure"] = "create-file-failure";
    FileActionResponses["RenameSuccess"] = "rename-file-success";
    FileActionResponses["RenameFailure"] = "rename-file-failure";
    FileActionResponses["DeleteSuccess"] = "delete-files-success";
    FileActionResponses["DeletePartialSuccess"] = "delete-partial-success";
    FileActionResponses["DeleteFailure"] = "delete-files-failure";
    FileActionResponses["MoveSuccess"] = "move-files-success";
    FileActionResponses["MoveFailure"] = "move-files-failure";
    FileActionResponses["ReadSuccess"] = "read-file-success";
    FileActionResponses["ReadFailure"] = "read-file-failure";
    FileActionResponses["UpdateSuccess"] = "update-success";
    FileActionResponses["UpdateFailure"] = "update-failure";
})(FileActionResponses = exports.FileActionResponses || (exports.FileActionResponses = {}));
//# sourceMappingURL=actions.js.map