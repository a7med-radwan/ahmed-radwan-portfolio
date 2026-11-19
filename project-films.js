'use strict';

// Each illustration is a schematic in a 360 × 130 space. Progress is supplied by
// the gallery so the same drawing can be played, stepped through, or printed still.
window.drawProjectFilm = (() => {
  const tau = Math.PI * 2;

  function phase(time, start, end) {
    const value = Math.max(0, Math.min(1, (time - start) / (end - start)));
    return value * value * (3 - 2 * value);
  }

  function line(ctx, points, color, weight = 1.5) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
    ctx.lineWidth = weight;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function rect(ctx, x, y, w, h, fill, stroke) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
    }
    if (stroke) {
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = stroke;
      ctx.strokeRect(x, y, w, h);
    }
  }

  function circle(ctx, x, y, radius, color, filled = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, tau);
    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  function label(ctx, text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = '600 12px Consolas, monospace';
    ctx.fillText(text, x, y);
  }

  // Draw a measured stroke and optionally carry a packet along its leading edge.
  function trace(ctx, points, amount, color, packet = false) {
    if (amount <= 0) return;
    const lengths = points.slice(1).map(([x, y], i) => Math.hypot(x - points[i][0], y - points[i][1]));
    let distance = lengths.reduce((sum, length) => sum + length, 0) * amount;
    const drawn = [points[0]];
    for (let i = 0; i < lengths.length; i++) {
      const fraction = Math.min(1, distance / lengths[i]);
      const [x, y] = points[i];
      drawn.push([x + (points[i + 1][0] - x) * fraction, y + (points[i + 1][1] - y) * fraction]);
      distance -= lengths[i];
      if (distance <= 0) break;
    }
    line(ctx, drawn, color, 2);
    if (packet && amount < 1) circle(ctx, ...drawn[drawn.length - 1], 3.5, color, true);
  }

  function wire(ctx, points, amount, colors) {
    line(ctx, points, colors.line);
    trace(ctx, points, amount, colors.accent, true);
  }

  function paper(ctx, x, y, w, h, colors) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - 10, y);
    ctx.lineTo(x + w, y + 10);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    line(ctx, [[x + w - 10, y], [x + w - 10, y + 10], [x + w, y + 10]], colors.muted, 1);
  }

  function gradly(ctx, t, c) {
    const aim = phase(t, 0, .32);
    circle(ctx, 54, 64, 28, c.text);
    circle(ctx, 54, 64, 17, c.muted);
    circle(ctx, 54, 64, 6, c.accent, true);
    const arrow = 14 * (1 - aim);
    line(ctx, [[54 + arrow, 64 - arrow], [80 + arrow, 38 - arrow], [80 + arrow, 30 - arrow]], c.accent, 3);
    line(ctx, [[75 + arrow, 43 - arrow], [86 + arrow, 43 - arrow]], c.accent, 3);
    wire(ctx, [[82, 64], [128, 64], [150, 42], [210, 42]], phase(t, .18, .56), c);
    paper(ctx, 210, 12, 119, 106, c);
    label(ctx, 'Roadmap', 222, 34, c.text);
    [0, 1, 2].forEach(i => {
      const y = 49 + i * 22;
      const check = phase(t, .43 + i * .13, .64 + i * .15);
      rect(ctx, 222, y, 10, 10, c.surface, c.muted);
      trace(ctx, [[223, y + 4], [227, y + 8], [235, y - 1]], check, c.accent);
      const width = [57, 45, 64][i];
      line(ctx, [[242, y + 5], [242 + width, y + 5]], c.line, 3);
      if (check > 0) line(ctx, [[242, y + 5], [242 + width * check, y + 5]], c.text, 2);
    });
  }

  function gaply(ctx, t, c) {
    // The missing piece of each skill strip is outlined until it is identified.
    for (let row = 0; row < 3; row++) {
      const gap = [2, 1, 3][row];
      for (let tile = 0; tile < 5; tile++) {
        const x = 23 + tile * 19;
        const y = 36 + row * 23;
        if (gap === tile) {
          const fit = phase(t, .04 + row * .12, .42 + row * .1);
          rect(ctx, x, y, 13, 12, c.bg, c.muted);
          rect(ctx, x + 5 * (1 - fit), y - 18 * (1 - fit), 13, 12, c.accent);
        } else {
          rect(ctx, x, y, 13, 12, c.surface, c.muted);
        }
      }
    }
    wire(ctx, [[123, 65], [154, 65], [170, 49], [199, 49]], phase(t, .35, .65), c);
    rect(ctx, 199, 28, 135, 82, c.bg, c.text);
    rect(ctx, 199, 28, 135, 21, c.raised || c.surface);
    line(ctx, [[199, 49], [334, 49]], c.muted);
    label(ctx, 'Week plan', 209, 44, c.text);
    for (let i = 0; i < 5; i++) {
      const x = 208 + i * 24;
      line(ctx, [[x, 60], [x + 13, 60]], c.muted);
      const fill = phase(t, .52 + i * .07, .71 + i * .07);
      rect(ctx, x, 67, 16, 28, c.surface, c.line);
      if (fill) rect(ctx, x + 3, 90 - fill * (9 + (i % 3) * 4), 10, fill * (9 + (i % 3) * 4), c.accent);
    }
  }

  function writeAI(ctx, t, c) {
    const spread = phase(t, 0, .36);
    ctx.save();
    ctx.translate(177 - 34 * spread, 66);
    ctx.rotate(-.115 * spread);
    rect(ctx, -72, -48, 144, 96, c.surface, c.muted);
    ctx.restore();
    ctx.save();
    ctx.translate(179 + 29 * spread, 65);
    ctx.rotate(.1 * spread);
    rect(ctx, -72, -47, 144, 94, c.surface, c.muted);
    ctx.restore();
    paper(ctx, 105, 12, 146, 104, c);
    label(ctx, 'Draft', 120, 35, c.text);
    const widths = [102, 83, 109, 64];
    widths.forEach((width, i) => {
      const amount = phase(t, .19 + i * .145, .40 + i * .145);
      const y = 49 + i * 13;
      line(ctx, [[120, y], [120 + width, y]], c.line, 1);
      if (amount > 0) line(ctx, [[120, y], [120 + width * amount, y]], c.text, 2);
      if (amount > 0 && amount < 1) rect(ctx, 121 + width * amount, y - 4, 2, 8, c.accent);
    });
    trace(ctx, [[120, 94], [169, 94]], phase(t, .76, .94), c.accent);
    trace(ctx, [[225, 99], [230, 104], [242, 89]], phase(t, .84, 1), c.accent);
  }

  function smartTask(ctx, t, c) {
    paper(ctx, 23, 34, 70, 64, c);
    label(ctx, 'Task', 33, 56, c.text);
    line(ctx, [[34, 68], [76, 68]], c.text);
    line(ctx, [[34, 78], [62, 78]], c.muted);
    [0, 1, 2].forEach(i => {
      const y = 17 + i * 36;
      wire(ctx, [[93, 65], [137, 65], [158, y + 12], [205, y + 12]], phase(t, .05 + i * .16, .43 + i * .16), c);
      const settle = phase(t, .23 + i * .17, .57 + i * .18);
      const x = 190 + 17 * settle;
      rect(ctx, x, y, 122, 25, c.bg, c.muted);
      rect(ctx, x, y, 4, 25, settle > .65 ? c.accent : c.line);
      const length = [66, 80, 48][i];
      if (settle > 0) line(ctx, [[x + 15, y + 13], [x + 15 + length * settle, y + 13]], c.text, 2);
    });
  }

  function expenses(ctx, t, c) {
    [0, 1].forEach(i => {
      const y = 23 + 59 * i;
      const move = phase(t, i * .16, .4 + i * .15);
      rect(ctx, 22 + move * 8, y + 4, 77, 28, c.surface, c.line);
      rect(ctx, 18 + move * 8, y, 77, 28, c.bg, c.muted);
      line(ctx, [[30 + move * 8, y + 14], [41 + move * 8, y + 14]], c.accent, 2);
      if (!i) line(ctx, [[35.5 + move * 8, y + 8.5], [35.5 + move * 8, y + 19.5]], c.accent, 2);
      line(ctx, [[49 + move * 8, y + 14], [81 + move * 8, y + 14]], c.text, 2);
      wire(ctx, [[106, y + 14], [132, y + 14], [161, 66], [210, 66]], phase(t, .2 + i * .16, .62 + i * .14), c);
    });
    paper(ctx, 211, 16, 113, 98, c);
    label(ctx, 'Plan', 224, 39, c.text);
    for (let i = 0; i < 4; i++) {
      const y = 55 + i * 12;
      line(ctx, [[224, y], [311, y]], c.line);
      trace(ctx, [[224, y], [248 + (i % 3) * 11, y]], phase(t, .55 + i * .085, .76 + i * .08), c.accent);
      rect(ctx, 296, y - 2, 10, 3, c.muted);
    }
  }

  function pharmacy(ctx, t, c) {
    // The lock opens before the authenticated packet reaches the inventory shelves.
    const open = phase(t, .19, .50);
    wire(ctx, [[86, 68], [250, 68]], phase(t, .33, .82), c);
    ctx.save();
    ctx.translate(42 + phase(t, 0, .23) * 20, 65);
    ctx.rotate(-.36 * (1 - open));
    circle(ctx, 0, 0, 12, c.accent);
    line(ctx, [[12, 0], [42, 0], [42, 8]], c.text, 3);
    line(ctx, [[32, 0], [32, 6]], c.text, 3);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(162 + open * 6, 55 - open * 11, 13, Math.PI, 0);
    ctx.lineTo(175 + open * 6, 61 - open * 11);
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 2;
    ctx.stroke();
    rect(ctx, 142, 58, 41, 34, c.bg, c.text);
    circle(ctx, 163, 71, 3, c.accent, true);
    line(ctx, [[163, 72], [163, 79]], c.accent, 2);
    [0, 1].forEach(row => {
      const y = 52 + row * 37;
      line(ctx, [[248, y + 10], [336, y + 10]], c.muted, 2);
      for (let i = 0; i < 3; i++) {
        const x = 253 + i * 27;
        const rise = phase(t, .58 + i * .06 + row * .06, .79 + i * .065 + row * .07);
        rect(ctx, x, y - 13 + 8 * (1 - rise), 17, 20, c.bg, c.muted);
        rect(ctx, x + 2, y - 5 + 8 * (1 - rise), 13 * rise, 4, c.accent);
      }
    });
  }

  function hospital(ctx, t, c) {
    rect(ctx, 23, 32, 78, 67, c.bg, c.text);
    rect(ctx, 51, 28, 22, 6, c.surface, c.muted);
    circle(ctx, 46, 57, 7, c.muted);
    line(ctx, [[33, 79], [33, 75], [39, 69], [53, 69], [59, 75], [59, 79]], c.text);
    trace(ctx, [[68, 65], [74, 72], [88, 54]], phase(t, 0, .32), c.accent);
    [0, 1].forEach(i => {
      const y = 18 + i * 61;
      const amount = phase(t, .18 + .17 * i, .62 + .20 * i);
      wire(ctx, [[101, 65], [149, 65], [175, y + 17], [216, y + 17]], amount, c);
      rect(ctx, 216, y, 109, 37, c.bg, c.muted);
      if (i === 0) {
        line(ctx, [[227, y + 18], [244, y + 18]], c.accent, 3);
        line(ctx, [[235.5, y + 10], [235.5, y + 26]], c.accent, 3);
      } else {
        ctx.save();
        ctx.translate(236, y + 18);
        ctx.rotate(-.7);
        ctx.beginPath();
        ctx.roundRect(-11, -5, 22, 10, 5);
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        line(ctx, [[0, -5], [0, 5]], c.accent);
        ctx.restore();
      }
      if (amount > 0) {
        line(ctx, [[253, y + 14], [253 + 54 * amount, y + 14]], c.text, 2);
        line(ctx, [[253, y + 23], [253 + 36 * amount, y + 23]], c.muted);
      }
    });
  }

  function library(ctx, t, c) {
    // Both dashboards are backed by the same library. Reveal their shelves in parallel.
    const spread = phase(t, 0, .45);
    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? 72 - spread * 48 : 173 + spread * 29;
      rect(ctx, x, 28, 132, 81, c.bg, c.text);
      line(ctx, [[x, 51], [x + 132, 51]], c.muted);
      label(ctx, side === 0 ? 'Administrator' : 'Librarian', x + 9, 44, c.text);
      line(ctx, [[x + 10, 91], [x + 120, 91]], c.muted, 2);
      for (let i = 0; i < 5; i++) {
        const amount = phase(t, .25 + i * .08 + side * .04, .52 + i * .08 + side * .04);
        const height = [21, 17, 26, 20, 24][(i + side) % 5];
        const left = x + 14 + i * 20;
        const top = 88 - height * amount;
        rect(ctx, left, top, 12, height * amount, i === 2 ? c.accent : c.surface, c.muted);
        if (amount > .8 && i !== 2) line(ctx, [[left + 3, top + 6], [left + 9, top + 6]], c.text);
      }
    }
  }

  function cloud(ctx, t, c) {
    for (let i = 0; i < 16; i++) {
      const x = 26 + (i % 4) * 11;
      const y = 47 + Math.floor(i / 4) * 11;
      rect(ctx, x, y, 6, 6, i % 3 ? c.muted : c.accent);
    }
    for (let i = 0; i < 3; i++) {
      const y = 22 + i * 40;
      wire(ctx, [[70, 66], [88, 66], [116, y], [138, y]], phase(t, .02 + i * .07, .41 + i * .07), c);
      rect(ctx, 138, y - 10, 36, 20, c.bg, c.text);
      const worker = phase(t, .33 + i * .08, .6 + i * .08);
      if (worker) rect(ctx, 143, y - 4, 26 * worker, 8, c.accent);
      wire(ctx, [[174, y], [193, y], [221, 64], [249, 64]], phase(t, .48 + i * .07, .79 + i * .065), c);
    }
    rect(ctx, 249, 36, 85, 58, c.bg, c.text);
    for (let i = 0; i < 4; i++) {
      const amount = phase(t, .74 + i * .036, .87 + i * .04);
      const height = [12, 25, 19, 32][i] * amount;
      rect(ctx, 260 + i * 16, 84 - height, 9, height, i === 3 ? c.accent : c.muted);
    }
  }

  const films = { gradly, gaply, 'write-ai': writeAI, smarttask: smartTask, expenses, pharmacy, hospital, library, cloud };

  return function drawProjectFilm(context, film, progress, colors) {
    const draw = films[film];
    if (!draw) return;
    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    draw(context, Math.max(0, Math.min(1, progress)), colors);
    context.restore();
  };
})();
