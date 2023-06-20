const appBuildPlugin = {
  name: "appBuildPlugin",
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) {
        console.log("Build failed.");
        return;
      }

      // ...
    });
  },
};

exports.appBuildPlugin = appBuildPlugin;
