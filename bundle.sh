cp ./index.html dist/
cp ./styles.css dist/

# copy v86 artifacts
cp ./node_modules/@glasssh/v86/build/libv86.js dist/
cp ./node_modules/@glasssh/v86/build/v86.wasm dist/
cp ./node_modules/@glasssh/v86/bios/seabios.bin dist/
cp ./node_modules/@glasssh/v86/bios/vgabios.bin dist/

# copy xterm
cp ./node_modules/xterm/lib/xterm.js dist/
cp ./node_modules/xterm/css/xterm.css dist/
# copy xterm-fit-addon
cp ./node_modules/xterm-addon-fit/lib/xterm-addon-fit.js dist/

babel --presets @babel/preset-typescript src/index.ts > dist/index.js
