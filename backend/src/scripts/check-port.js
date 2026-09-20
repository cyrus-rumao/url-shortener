import { execSync } from "child_process";

try {
  const output = execSync(
    `powershell -Command "Get-NetTCPConnection -LocalPort 2000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
    { encoding: "utf8" },
  ).trim();

  if (output) {
    console.log(`⚠️ Port 2000 is already in use by PID ${output}`);
  } else {
    console.log("✅ Port 2000 is free");
  }
} catch {
  console.log("✅ Port 2000 is free");
}
