import { build, transform } from "esbuild";
import { minify } from "html-minifier-terser";
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync, existsSync } from "node:fs";

const OUT = "dist";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const html = readdirSync(".").filter((f) => f.endsWith(".html"));
for (const f of html) {
  const src = readFileSync(f, "utf8");
  const out = await minify(src, {
    collapseWhitespace: true, conservativeCollapse: true, removeComments: true, minifyCSS: true,
    minifyJS: { compress: { drop_console: false }, mangle: true, format: { comments: false } },
  });
  writeFileSync(`${OUT}/${f}`, out);
}
for (const f of ["products.js", "install.js", "sw.js"]) {
  const r = await transform(readFileSync(f, "utf8"), { minify: true, legalComments: "none", target: "es2020" });
  writeFileSync(`${OUT}/${f}`, r.code);
}
const css = await transform(readFileSync("panel.css", "utf8"), { loader: "css", minify: true, legalComments: "none" });
writeFileSync(`${OUT}/panel.css`, css.code);
for (const f of readdirSync(".")) if (/^manifest.*\.json$/.test(f) || /\.(png|ico|svg|webp|jpg)$/.test(f)) cpSync(f, `${OUT}/${f}`);
if (existsSync("images")) cpSync("images", `${OUT}/images`, { recursive: true });
console.log("built:", readdirSync(OUT).join(", "));
