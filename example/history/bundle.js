(function (modules) {  // webpackBootstrap

  // The module cache
  var installedModules = {};

  // The require function
  function __webpack_require__ (moduleId) {
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    // Execute the module function
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    // Flag the module as loaded
    module.l = true;
    // Return the exports of the module
    return module.exports;
  }

  // Load entry module and return exports
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})
({

  "./src/a.js": (function (module, exports, __webpack_require__) {
    eval("const b = __webpack_require__(/*! ./base/b */ \"./src/base/b.js\")\r\n\r\nmodule.exports = 'a' + b\r\n\n\n//# sourceURL=webpack:///./src/a.js?");
  }),

  "./src/base/b.js": (function (module, exports) {
    eval("module.exports = 'b'\r\n\n\n//# sourceURL=webpack:///./src/base/b.js?");
  }),

  "./src/index.js": (function (module, exports, __webpack_require__) {
    eval("const str = __webpack_require__(/*! ./a */ \"./src/a.js\")\r\n\r\nconsole.log(str)\r\n\n\n//# sourceURL=webpack:///./src/index.js?");
  })

});
