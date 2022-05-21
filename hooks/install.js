const { exec } = require("child_process");
const { join, basename } = require("path");
const { cp } = require("fs/promises");

function handleSysCall(err, stdout) {
  if (err != null) {
    console.error("Error executing system call");
    process.exit(1);
  }
  return stdout.split("\n").slice(0, -1).join("");
}

function copyHooks(hooksDirectory) {
  exec("git rev-parse --show-toplevel", async function (err, stdout) {
    const worktreeDir = handleSysCall(err, stdout);

    await cp(`${worktreeDir}/hooks/`, hooksDirectory, {
      recursive: true,
      filter: function (v) {
        return v.includes(basename(__filename)) === false;
      },
    });
  });
}

exec("git rev-parse --git-path hooks", function (err, stdout) {
  const hooksDirectory = join(process.cwd(), handleSysCall(err, stdout));
  copyHooks(hooksDirectory);
});
