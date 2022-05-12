import "@glasssh/v86"
import "xterm"
import "xterm-addon-fit";

const fit = new FitAddon.FitAddon();
const theme = {
  background: '#252525',
  cursor: '#A0A0A0',
  foreground: '#A0A0A0',
  black: '#252525',
  blue: '#268BD2',
  brightBlack: '#505354',
  brightBlue: '#62ADE3',
  brightCyan: '#94D8E5',
  brightGreen: '#B7EB46',
  brightMagenta: '#BFA0FE',
  brightRed: '#FF5995',
  brightWhite: '#F8F8F2',
  brightYellow: '#FEED6C',
  cyan: '#56C2D6',
  green: '#82B414 ',
  magenta: '#8C54FE',
  red: '#F92672',
  white: '#CCCCC6',
  yellow: '#FD971F'
}

const saveToFileInput = document.getElementById('save_file')!;
const v86Container = document.getElementById('screen_container')!;
const xtermContainer = document.getElementById('terminal')!
xtermContainer.style.height = '50vh';
v86Container.style.display = 'initial';
saveToFileInput.style.display = 'initial';

const terminal = new Terminal({ theme });
terminal.loadAddon(fit);
terminal.open(xtermContainer)
fit.fit();

window.onresize = (event: UIEvent) => fit.fit();

const params = (new URL(window.location.toString())).searchParams;
const networkRelayURLParam = params.get("network_relay_url");
const networkRelayURL = networkRelayURLParam ? decodeURIComponent(networkRelayURLParam) : undefined;
let relayDidBootstrap = false;

const emulator = new V86Starter({
  wasm_path: "/v86.wasm",
  memory_size: 1024 * 1024 * 1024,
  vga_memory_size: 8 * 1024 * 1024,
  bios: {
    url: "/seabios.bin",
  },
  vga_bios: {
    url: "/vgabios.bin",
  },
  cdrom: {
    url: "alpine-virt-3.15.4-x86.iso"
  },

  // filesystem: {
  //   baseurl: "/arch_root/arch/",
  //   basefs: "/arch_root/fs.json",
  // },

  // initial_state: {
  //   url: "/state/arch-base.bin.zst",
  // },
  
  screen_container: document.getElementById('screen_container'),
  // bzimage_initrd_from_filesystem: true,
  
  acpi: false,
  autostart: true,
  // disable_keyboard: true,
  // disable_mouse: true,
  disable_speaker: true,

  cmdline: [
    "rw",
    // "root=host9p rootfstype=9p rootflags=trans=virtio,cache=loose,page_poison=on",
    // "init=/usr/lib/systemd/systemd",
  ].join(" "),

  network_relay_url: `ws://${networkRelayURL}`,
});

const sendString = (data: string) => {
  for(let i = 0; i < data.length; i++){
    emulator.bus.send("serial0-input", data.charCodeAt(i));
  }
}

const sendCode = (codes: number[]) => codes.forEach(code => emulator.bus.send("serial0-input", code));

const initialSequence = () => {
  terminal.clear();
  terminal.write("Please authenicate. ")
  sendCode([13]);
}

const relayInit = () => {
  const enableDhcp = "ip link set enp0s5 down && rmmod ne2k-pci && modprobe ne2k-pci && dhcpcd -w4 enp0s5";
  sendString(enableDhcp);
  sendCode([13]);
}

terminal.writeln("Loading... ");
terminal.onData(sendString);
terminal.attachCustomKeyEventHandler((key: KeyboardEvent) => {
  if (key.code === 'KeyV' && key.ctrlKey && key.shiftKey) {
    navigator.clipboard.readText().then(clipText => terminal.write(clipText));
    return false;
  }
  
  return true;
});

emulator.add_listener("emulator-ready", () => window.setTimeout(() => initialSequence(), 100));
emulator.add_listener("serial0-output-char", (chr: string) => terminal.write(chr));
// side-effects only
emulator.add_listener("serial0-output-line", (line: string) => {
  if(line.startsWith("Last login:") && !relayDidBootstrap && networkRelayURL){
    relayInit();
    relayDidBootstrap = true;
  }
});

saveToFileInput.onclick = function(){
  emulator.save_state(function(error, new_state){
    if(error){
        throw error;
    }

    var a = document.createElement("a");
    a.download = "v86state.bin";
    a.href = window.URL.createObjectURL(new Blob([new_state]));
    a.dataset.downloadurl = "application/octet-stream:" + a.download + ":" + a.href;
    a.click();
  });
};