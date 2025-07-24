let kodiIp = "10.0.0.54"; // Valor inicial (por si no hay nada guardado)
const PORT = 8080;

export const setKodiIp = (ip) => {
  kodiIp = ip;
  try {
    localStorage.setItem("kodiIp", ip);
  } catch {}
};

// Si estamos en desarrollo, usamos el proxy de Vite
const isDev = import.meta.env.DEV;

const makeUrl = () => {
  return isDev
    ? "/kodi/jsonrpc" // proxy (sin CORS) durante desarrollo
    : `http://${kodiIp}:${PORT}/jsonrpc`; // producción o acceso directo
};

const sendKodiCommand = async (method, params = {}) => {
  try {
    const response = await fetch(makeUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });

    const result = await response.json();
    console.log(`✅ Enviado: ${method}`, result);
    return result;
  } catch (err) {
    console.error(`❌ Error enviando ${method}`, err);
  }
};

export const kodi = {
  back:       () => sendKodiCommand("Input.Back"),
  home:       () => sendKodiCommand("Input.Home"),
  info:       () => sendKodiCommand("Input.Info"),
  select:     () => sendKodiCommand("Input.Select"),
  up:         () => sendKodiCommand("Input.Up"),
  down:       () => sendKodiCommand("Input.Down"),
  left:       () => sendKodiCommand("Input.Left"),
  right:      () => sendKodiCommand("Input.Right"),

  shutdown:   () => sendKodiCommand("System.Shutdown"),
  reboot:     () => sendKodiCommand("System.Reboot"),
  quit:       () => sendKodiCommand("Application.Quit"),

  playPause:  () => sendKodiCommand("Player.PlayPause", { playerid: 1 }),
  stop:       () => sendKodiCommand("Player.Stop", { playerid: 1 }),
  next:       () => sendKodiCommand("Player.GoTo", { playerid: 1, to: "next" }),
  prev:       () => sendKodiCommand("Player.GoTo", { playerid: 1, to: "previous" }),
  setVolume:  (v) => sendKodiCommand("Application.SetVolume", { volume: v }),
  toggleMute: () => sendKodiCommand("Application.SetMute", { mute: "toggle" }),
};

// Leer IP guardada en localStorage al iniciar
try {
  const saved = localStorage.getItem("kodiIp");
  if (saved) setKodiIp(saved);
} catch {}