# Changuito para Steam

Extensión para Firefox que muestra los precios de la tienda de Steam en pesos argentinos con impuestos incluidos, para saber cuánto vas a pagar con una tarjeta emitida en Argentina. Además analiza qué tan bueno es el precio regional de cada juego.

Está pensada para ser liviana y minimalista: solo trabaja cuando la página cambia y no agrega nada que no haga falta. No tiene ningún tipo de monetización, publicidad ni enlaces de referidos.

## Funcionalidades

- Conversión de precios a pesos con impuestos incluidos, visibles en pesos, en dólares o según tu saldo de Steam.
- Análisis del precio regional respecto al sugerido por Valve.
- Configuración sincronizada con Firefox Sync.

## Compilación

Requiere Node.js 24 o superior.

```sh
npm ci
npm run build
```

La extensión compilada queda en `dist/`.

## Créditos

- [Steamcito](https://github.com/emilianog94/Steamcito-Precios-Steam-Argentina-Impuestos-Incluidos) - Inspiración de funcionalidad original
- [Noto Emoji](https://github.com/googlefonts/noto-emoji) - Ícono
