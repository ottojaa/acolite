"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchResponses = exports.StoreResponses = exports.FileActionResponses = exports.SearchActions = exports.StoreActions = exports.FileActions = exports.FolderActionResponses = exports.FolderActions = void 0;
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
    FileActions["Update"] = "update-file";
    FileActions["DeleteFiles"] = "delete-files";
    FileActions["MoveFiles"] = "move-files";
    FileActions["ReadFile"] = "read-file";
    FileActions["OpenFileLocation"] = "open-file-location";
})(FileActions = exports.FileActions || (exports.FileActions = {}));
var StoreActions;
(function (StoreActions) {
    StoreActions["InitApp"] = "init-app";
    StoreActions["GetStore"] = "read-store";
    StoreActions["UpdateStore"] = "update-store";
    StoreActions["GetRecentlyModified"] = "get-recently-modified";
    StoreActions["GetBookmarkedFiles"] = "get-bookmarked-files";
})(StoreActions = exports.StoreActions || (exports.StoreActions = {}));
var SearchActions;
(function (SearchActions) {
    SearchActions["Query"] = "query-index";
})(SearchActions = exports.SearchActions || (exports.SearchActions = {}));
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
var StoreResponses;
(function (StoreResponses) {
    StoreResponses["ReadStoreSuccess"] = "read-store-success";
    StoreResponses["ReadStoreFailure"] = "read-store-failure";
    StoreResponses["CreateStoreSuccess"] = "create-store-success";
    StoreResponses["CreateStoreFailure"] = "create-store-failure";
    StoreResponses["UpdateStoreSuccess"] = "update-store-success";
    StoreResponses["UpdateStoreFailure"] = "update-store-failure";
    StoreResponses["InitAppSuccess"] = "init-app-success";
    StoreResponses["InitAppFailure"] = "init-app-failure";
    StoreResponses["GetRecentlyModifiedSuccess"] = "get-recently-modified-success";
    StoreResponses["GetRecentlyModifiedFailure"] = "get-recently-modified-failure";
    StoreResponses["GetBookmarkedFilesSuccess"] = "get-bookmarked-success";
    StoreResponses["GetBookmarkedFilesFailure"] = "get-bookmarked-failure";
})(StoreResponses = exports.StoreResponses || (exports.StoreResponses = {}));
var SearchResponses;
(function (SearchResponses) {
    SearchResponses["QuerySuccess"] = "query-success";
    SearchResponses["QueryFailure"] = "query-failure";
})(SearchResponses = exports.SearchResponses || (exports.SearchResponses = {}));
//# sourceMappingURL=actions.js.map