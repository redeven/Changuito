[![Greasy Fork](https://img.shields.io/greasyfork/v/603075)](https://greasyfork.org/en/scripts/603075-changuito-para-steam)

# Changuito para Steam

Extensión para Firefox y userscript para cualquier navegador que muestra los precios de la tienda de Steam en pesos argentinos con impuestos incluidos, para saber cuánto vas a pagar con una tarjeta emitida en Argentina. Además analiza qué tan bueno es el precio regional de cada juego.

Está pensada para ser liviana y minimalista: solo trabaja cuando la página cambia y no agrega nada que no haga falta. No tiene ningún tipo de monetización, publicidad ni enlaces de referidos.

## Funcionalidades

- Conversión de precios a pesos con impuestos incluidos, visibles en pesos, en dólares o según tu saldo de Steam.
- Análisis del precio regional respecto al sugerido por Valve.
- Configuración sincronizada con Firefox Sync en la extensión.

## Compilación

Requiere Node.js 24 o superior.

```sh
npm ci
npm run build              # extensión de Firefox y userscript
npm run build:firefox      # solo la extensión de Firefox, en dist/
npm run build:userscript   # solo el userscript, en dist-userscript/changuito.user.js
```

## Créditos

- [Steamcito](https://github.com/emilianog94/Steamcito-Precios-Steam-Argentina-Impuestos-Incluidos) - Inspiración de funcionalidad original
- [Noto Emoji](https://github.com/googlefonts/noto-emoji) - Ícono
