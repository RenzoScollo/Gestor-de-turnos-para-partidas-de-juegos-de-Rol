import { test, expect, type Page } from '@playwright/test';

async function registrar(page: Page, nickname: string, tipo = 'Anfitrión') {
  await page.goto('/register');
  await page.getByPlaceholder('Nombre y apellido').fill('Anfitrión de prueba');
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByLabel(tipo, { exact: true }).check();
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function ingresar(page: Page, nickname: string) {
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('registro, login, partida y sesión persistentes; expiración de autenticación', async ({ page, context }) => {
  await registrar(page, 'host_e2e');
  await ingresar(page, 'host_e2e');
  await page.goto('/games');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Campaña E2E');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Campaña E2E' })).toBeVisible();
  await page.goto('/sessions');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  const partida = page.getByRole('combobox', { name: 'Partida', exact: true });
  const option = await partida.locator('option').filter({ hasText: 'Campaña E2E' }).getAttribute('value');
  expect(option).toBeTruthy();
  await partida.selectOption(option!);
  await page.getByLabel('Número de sesión', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Planificada', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: 'Planificada', exact: true })).toBeVisible();
  // Invalida la cookie en el servidor, sin cambiar el estado React: el próximo 401 debe limpiar la sesión.
  const logout = await context.request.post('/api/auth/logout');
  expect(logout.ok()).toBeTruthy();
  await page.getByRole('button', { name: 'Actualizar listado' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/sessions');
  await expect(page).toHaveURL(/\/login$/);
});

test('cerrar sesión impide volver a las páginas privadas', async ({ page }) => {
  await registrar(page, 'logout_e2e');
  await ingresar(page, 'logout_e2e');
  await page.getByRole('button', { name: 'Cerrar Sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/games');
  await expect(page).toHaveURL(/\/login$/);
});

test('login con Enter, navegación por teclado y menú sin desborde en tres tamaños', async ({ page }) => {
  await registrar(page, 'teclado_e2e');
  await page.getByLabel('Nickname', { exact: true }).fill('teclado_e2e');
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByLabel('Contraseña', { exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/dashboard$/);
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(navigation.getByRole('link')).toHaveCount(11);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const games = navigation.getByRole('link', { name: 'Partidas', exact: true });
    await games.focus();
    await expect(games).toBeFocused();
    await games.press('Enter');
    await expect(page).toHaveURL(/\/games$/);
    await expect(games).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'Partidas', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await navigation.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`dashboard-${width}.png`), fullPage: true });
  }
  await page.goto('/games');
  await expect(page.getByRole('heading', { name: 'Partidas', exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('todas las pantallas principales caben en móvil, tablet y escritorio', async ({ page }) => {
  await registrar(page, 'pantallas_e2e');
  await ingresar(page, 'pantallas_e2e');
  // Datos reales de prueba para revisar pantallas pobladas, no solo estados vacíos.
  const crear = async (path: string, data: Record<string, unknown>) => {
    const response = await page.request.post(`/api/${path}`, { data });
    expect(response.status(), await response.text()).toBe(201);
    return response.json();
  };
  const { usuario } = await (await page.request.get('/api/auth/me')).json();
  const clase = await crear('clases', { nombreClase: 'Exploradores de las Tierras del Norte', descripcionClase: 'Una descripción extensa para comprobar la lectura del catálogo en pantallas pequeñas.' });
  const tienda = await crear('tiendas', { nombre: 'Armería y provisiones del Valle del Norte', claseTienda: 'Armas', idClase: clase.idClase });
  await crear('objetos', { nombre: 'Espada ceremonial de los guardianes', descripcion: 'Objeto de prueba para el catálogo responsive.', tipoObjeto: 'Arma', valor: 40, nivelObjeto: 1, esUnico: true, idTienda: tienda.idTienda });
  const partida = await crear('partidas', { nombre: 'La aventura de los guardianes del Valle', estado: 'activa', limiteJugadores: 4, esPrivada: false, idUsuarioAnfitrion: usuario.idUsuario });
  await crear('jugadores', { idUsuario: usuario.idUsuario, estado: true });
  await crear('personajes', { nombreFicticio: 'Explorador de las Tierras del Norte', raza: 'Humano', idClase: clase.idClase, idUsuarioJugador: usuario.idUsuario, idPartida: partida.idPartida });
  await crear('sesiones', { idPartida: partida.idPartida, numSesion: 1, duracionSesion: 60 });
  await crear('misiones', { idPartida: partida.idPartida, numSesion: 1, numMision: 1, descripcion: 'Recuperar las provisiones perdidas en el bosque', dineroTotal: 100, xpTotal: 50 });
  const errores: string[] = [];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['dashboard', 'users', 'games', 'characters', 'classes', 'stores', 'objects', 'sessions', 'missions', 'inventory', 'profiles']) {
      await page.goto(`/${path}`);
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cerrar Sesión', exact: true })).toBeVisible();
      await expect(page.getByText('Cargando…', { exact: true })).toHaveCount(0);
      const dimensions = await page.getByRole('main').evaluate(main => ({
        page: document.documentElement.scrollWidth - window.innerWidth,
        main: main.scrollWidth - main.clientWidth,
      }));
      if (dimensions.page > 1 || dimensions.main > 1) errores.push(`${path} a ${width}px: ${JSON.stringify(dimensions)}`);
      if (width === 375) await page.screenshot({ path: test.info().outputPath(`${path}-375.png`), fullPage: true });
    }
  }
  expect(errores).toEqual([]);

  // El mismo módulo debe seguir siendo usable con ambos temas, incluyendo ficha y edición.
  await page.goto('/characters');
  const characterCard = page.locator('.personaje-card').filter({ hasText: 'Explorador de las Tierras del Norte' });
  await expect(characterCard).toBeVisible();
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await characterCard.click();
      await expect(page.getByRole('heading', { name: /Ficha de Personaje/ })).toBeVisible();
      await characterCard.getByRole('button', { name: 'Editar', exact: true }).click();
      const name = page.getByLabel('Nombre ficticio *', { exact: true });
      await expect(name).toBeVisible();
      // Contraste de los textos principales contra su fondo opaco efectivo (WCAG AA, 4.5:1).
      // Compone fondos RGBA con sus ancestros; no sustituye una auditoría de imágenes o de toda la UI.
      const contrasts = await page.locator('.nav-menu a, .personaje-nombre, .personaje-meta, .personaje-clase-raza, .stat-val, .stat-lbl, .personaje-filtros label, .personaje-form h2, .personaje-form h3, .personaje-form input').evaluateAll(elements => {
        const rgba = (color: string) => color.match(/[\d.]+/g)!.map(Number);
        const luminance = (color: number[]) => color.map(channel => {
          const c = channel / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
        return elements.map(element => {
          const layers: number[][] = [];
          for (let parent: Element | null = element; parent; parent = parent.parentElement) {
            layers.push(rgba(getComputedStyle(parent).backgroundColor));
          }
          const effectiveBackground = layers.reverse().reduce((base, layer) => {
            const alpha = layer[3] ?? 1;
            return base.map((channel, i) => layer[i] * alpha + channel * (1 - alpha));
          }, [255, 255, 255]);
          const foreground = luminance(rgba(getComputedStyle(element).color).slice(0, 3));
          const background = luminance(effectiveBackground);
          return { text: element.textContent?.slice(0, 60) || element.tagName, ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) };
        });
      });
      expect(contrasts.length).toBeGreaterThan(0);
      expect(contrasts.filter(item => item.ratio < 4.5), `${colorScheme} ${width}px`).toEqual([]);
      await expect.poll(() => page.getByRole('main').evaluate(main => Math.max(document.documentElement.scrollWidth - window.innerWidth, main.scrollWidth - main.clientWidth))).toBeLessThanOrEqual(1);
      await page.screenshot({ path: test.info().outputPath(`personaje-form-detalle-${colorScheme}-${width}.png`), fullPage: true });
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    }
  }
  await characterCard.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Nombre ficticio *', { exact: true }).fill('Explorador actualizado');
  await page.getByLabel('Raza *', { exact: true }).fill('Elfo');
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  const updatedCard = page.locator('.personaje-card').filter({ hasText: 'Explorador actualizado' });
  await expect(updatedCard).toContainText('Elfo');
  await page.reload();
  await expect(updatedCard).toContainText('Elfo');
  // Clase sin personajes: verifica el filtro negativo y el restablecimiento del listado.
  const emptyClass = await crear('clases', { nombreClase: 'Clase sin personajes E2E', descripcionClase: 'Prueba del estado vacío filtrado.' });
  await page.reload();
  await page.getByLabel('Filtrar por Clase:').selectOption(String(emptyClass.idClase));
  await expect(page.locator('.personaje-card')).toHaveCount(0);
  await expect(page.getByText('No hay personajes creados con la clase seleccionada.')).toBeVisible();
  await page.getByLabel('Filtrar por Clase:').selectOption(String(clase.idClase));
  await expect(updatedCard).toBeVisible();
  await page.getByLabel('Filtrar por Clase:').selectOption('todas');
  await expect(updatedCard).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await updatedCard.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Personaje eliminado.');
  await expect(updatedCard).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Filtrar por Clase:')).toBeVisible();
  await expect(updatedCard).toHaveCount(0);
});

test('usuario edita sus datos y contraseña, vuelve a ingresar y elimina su cuenta', async ({ page }) => {
  await registrar(page, 'cuenta_editable');
  await ingresar(page, 'cuenta_editable');
  await page.goto('/users');
  await page.locator('.usuario-card').filter({ hasText: 'cuenta_editable' }).click();
  await page.getByRole('button', { name: /Editar/ }).click();
  await page.getByLabel('Nombre de usuario', { exact: false }).fill('Nombre modificado');
  await page.getByLabel('Nickname', { exact: false }).fill('cuenta_modificada');
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(page.locator('.usuario-card').filter({ hasText: 'cuenta_modificada' })).toContainText('Nombre modificado');
  await page.reload();
  await page.locator('.usuario-card').filter({ hasText: 'cuenta_modificada' }).click();
  await page.getByRole('button', { name: /Editar/ }).click();
  await page.getByLabel('Contraseña', { exact: false }).fill('ClaveActualizada123');
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nickname', { exact: true }).fill('cuenta_modificada');
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Usuario o contraseña incorrecta');
  await page.getByLabel('Contraseña', { exact: true }).fill('ClaveActualizada123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/users');
  await page.locator('.usuario-card').filter({ hasText: 'cuenta_modificada' }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Eliminar/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nickname', { exact: true }).fill('cuenta_modificada');
  await page.getByLabel('Contraseña', { exact: true }).fill('ClaveActualizada123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Usuario o contraseña incorrecta');
});

test('catálogo: editar clase y tienda, quitar vínculo y respetar dependencias al eliminar', async ({ page }) => {
  await registrar(page, 'catalogo_crud');
  await ingresar(page, 'catalogo_crud');
  await page.goto('/classes');
  await page.getByRole('button', { name: '+ Nueva Clase', exact: true }).click();
  await page.getByLabel('Nombre de la Clase *', { exact: true }).fill('Clase catálogo E2E');
  await page.getByLabel('Descripción de la Clase *', { exact: true }).fill('Descripción inicial');
  await page.getByRole('button', { name: 'Crear Clase', exact: true }).click();
  const card = page.locator('.clase-card').filter({ hasText: 'Clase catálogo E2E' });
  await card.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Descripción de la Clase *', { exact: true }).fill('Descripción actualizada');
  await page.getByRole('button', { name: 'Actualizar Clase', exact: true }).click();
  await expect(card).toContainText('Descripción actualizada');
  await page.reload();
  await expect(card).toContainText('Descripción actualizada');
  await card.focus();
  await card.press('Enter');
  await expect(page.getByRole('button', { name: 'Cerrar detalle', exact: true })).toBeVisible();

  await page.goto('/stores');
  await page.getByRole('button', { name: '+ Nueva Tienda', exact: true }).click();
  await page.getByLabel('Nombre de la tienda *', { exact: true }).fill('Tienda catálogo E2E');
  await page.getByRole('combobox', { name: /^Tipo de tienda/ }).selectOption('Armas');
  await page.getByRole('combobox', { name: /^Clase vinculada/ }).selectOption({ label: 'Clase catálogo E2E' });
  await page.getByRole('button', { name: 'Crear Tienda', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: 'Tienda catálogo E2E' });
  await expect(row).toContainText('Clase catálogo E2E');
  await page.goto('/classes');
  page.once('dialog', dialog => dialog.accept());
  const rejectedDelete = page.waitForResponse(response => response.url().includes('/api/clases/') && response.request().method() === 'DELETE');
  await card.getByRole('button', { name: 'Eliminar', exact: true }).click();
  expect((await rejectedDelete).status()).toBe(409);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(card).toBeVisible();

  await page.goto('/stores');
  await row.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Nombre de la tienda *', { exact: true }).fill('Tienda editada E2E');
  await page.getByRole('combobox', { name: /^Tipo de tienda/ }).selectOption('Magia');
  await page.getByRole('combobox', { name: /^Clase vinculada/ }).selectOption('');
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  const updated = page.getByRole('row').filter({ hasText: 'Tienda editada E2E' });
  await expect(updated).toContainText('Magia');
  await expect(updated).not.toContainText('Clase catálogo E2E');
  await page.reload();
  await expect(updated).toContainText('Magia');
  await expect(updated).not.toContainText('Clase catálogo E2E');
  await updated.getByRole('button', { name: 'Ver detalle', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Detalle de tienda/ })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await updated.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Tienda eliminada.');
  await page.reload();
  await expect(page.getByRole('button', { name: '+ Nueva Tienda', exact: true })).toBeVisible();
  await expect(updated).toHaveCount(0);
  await page.goto('/classes');
  page.once('dialog', dialog => dialog.accept());
  await card.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Clase eliminada correctamente.');
  await page.reload();
  await expect(page.getByRole('button', { name: '+ Nueva Clase', exact: true })).toBeVisible();
  await expect(card).toHaveCount(0);
});

test('dos usuarios completan juego, recompensas, karma y comercio con inventarios', async ({ page: host, browser }) => {
  const player = await browser.newPage({ baseURL: 'http://127.0.0.1:5174' });
  try {
    await registrar(host, 'director_juego');
    await ingresar(host, 'director_juego');
    await host.goto('/classes');
    await host.getByRole('button', { name: '+ Nueva Clase', exact: true }).click();
    await host.getByLabel('Nombre de la Clase *', { exact: true }).fill('Explorador E2E');
    await host.getByLabel('Descripción de la Clase *', { exact: true }).fill('Exploración y supervivencia');
    await host.getByRole('button', { name: 'Crear Clase', exact: true }).click();
    await expect(host.getByRole('status')).toContainText('Clase creada correctamente');
    await host.goto('/games');
    await host.getByRole('button', { name: 'Crear', exact: true }).click();
    await host.getByLabel('Nombre', { exact: true }).fill('Aventura compartida');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(host.getByRole('row').filter({ hasText: 'Aventura compartida' })).toBeVisible();

    await registrar(player, 'jugador_aventura', 'Jugador');
    await ingresar(player, 'jugador_aventura');
    await player.goto('/characters');
    await player.getByRole('button', { name: '+ Crear Personaje', exact: true }).click();
    await player.getByLabel('Nombre ficticio *', { exact: true }).fill('Arwen E2E');
    await player.getByLabel('Raza *', { exact: true }).fill('Elfa');
    await player.getByRole('combobox', { name: 'Clase de personaje *', exact: true }).selectOption({ label: 'Explorador E2E' });
    const games = player.getByRole('combobox', { name: 'Partida *', exact: true });
    const gameId = await games.locator('option').filter({ hasText: 'Aventura compartida' }).getAttribute('value');
    await games.selectOption(gameId!);
    await player.getByRole('button', { name: 'Crear Personaje', exact: true }).click();
    await expect(player.getByRole('status')).toContainText('Personaje creado correctamente');

    const ownCharacter = player.locator('.personaje-card').filter({ hasText: 'Arwen E2E' });
    await expect(ownCharacter.getByRole('button', { name: 'Editar', exact: true })).toBeVisible();
    for (const foreign of await player.locator('.personaje-card').filter({ hasNotText: 'Arwen E2E' }).all()) {
      await expect(foreign.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
      await expect(foreign.getByRole('button', { name: 'Eliminar', exact: true })).toHaveCount(0);
    }
    await host.goto('/characters');
    await expect(host.locator('.personaje-card').filter({ hasText: 'Arwen E2E' })).toBeVisible();
    await expect(host.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
    await expect(host.getByRole('button', { name: 'Eliminar', exact: true })).toHaveCount(0);

    await host.goto('/sessions');
    await host.getByRole('button', { name: 'Crear', exact: true }).click();
    await host.getByRole('combobox', { name: 'Partida', exact: true }).selectOption(gameId!);
    await host.getByLabel('Número de sesión', { exact: true }).fill('1');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    const sessionRow = host.getByRole('row').filter({ hasText: 'Aventura compartida' });
    await sessionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await host.getByRole('checkbox', { name: 'Arwen E2E', exact: true }).check();
    await host.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await expect(sessionRow).toContainText('En curso');

    await host.goto('/missions');
    await host.getByRole('button', { name: 'Crear', exact: true }).click();
    await host.getByRole('combobox', { name: 'Partida', exact: true }).selectOption(gameId!);
    await host.getByLabel('Número de sesión', { exact: true }).fill('1');
    await host.getByLabel('Número de misión', { exact: true }).fill('1');
    await host.getByLabel('Descripción', { exact: true }).fill('Rescatar al mercader');
    await host.getByLabel('Dinero total', { exact: true }).fill('100');
    await host.getByLabel('XP total', { exact: true }).fill('50');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    const missionRow = host.getByRole('row').filter({ hasText: 'Rescatar al mercader' });
    await missionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await host.getByLabel('dinero', { exact: true }).fill('100');
    await host.getByLabel('xp', { exact: true }).fill('50');
    await host.getByRole('button', { name: 'Completar misión', exact: true }).click();
    await expect(missionRow).toContainText('Completada');
    await missionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(host.getByRole('button', { name: 'Completar misión', exact: true })).toHaveCount(0);

    await player.reload();
    const stats = player.locator('.personaje-card').filter({ hasText: 'Arwen E2E' });
    await expect(stats.locator('.stat-item').filter({ hasText: 'XP' }).locator('.stat-val')).toHaveText('50');
    await expect(stats.locator('.stat-item').filter({ hasText: 'Dinero' }).locator('.stat-val')).toHaveText('🪙 200');
    await host.goto('/sessions');
    await sessionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await host.getByRole('button', { name: 'Finalizar sesión', exact: true }).click();
    await expect(sessionRow).toContainText('Finalizada');
    await player.goto('/sessions');
    await player.getByRole('row').filter({ hasText: 'Aventura compartida' }).getByRole('button', { name: 'Ver detalle' }).click();
    await player.getByRole('button', { name: 'Buena experiencia (+1)', exact: true }).click();
    await expect(player.getByRole('heading', { name: 'Detalle', exact: true })).toHaveCount(0);
    await host.goto('/profiles');
    await expect(host.getByText('Karma: 1. Partidas activas: 1', { exact: true })).toBeVisible();

    await host.goto('/stores');
    await host.getByRole('button', { name: '+ Nueva Tienda', exact: true }).click();
    await host.getByLabel('Nombre de la tienda *', { exact: true }).fill('Armería E2E');
    await host.getByRole('combobox', { name: 'Tipo de tienda *', exact: true }).selectOption('Armas');
    await host.getByRole('button', { name: 'Crear Tienda', exact: true }).click();
    await expect(host.getByRole('status')).toContainText('Tienda creada');
    await host.goto('/objects');
    await host.getByRole('button', { name: 'Nuevo objeto', exact: true }).click();
    await host.getByLabel('Nombre', { exact: true }).fill('Arco E2E');
    await host.getByLabel('Descripción', { exact: true }).fill('Arco de exploración');
    await host.getByLabel('Tipo', { exact: true }).fill('Arma');
    await host.getByLabel('Valor', { exact: true }).fill('40');
    await host.getByLabel('Nivel', { exact: true }).fill('1');
    await host.getByRole('combobox', { name: 'Tienda (opcional)', exact: true }).selectOption({ label: 'Armería E2E' });
    const createdObject = host.waitForResponse(r => r.url().endsWith('/api/objetos') && r.request().method() === 'POST');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    const objectResponse = await createdObject;
    expect(objectResponse.status()).toBe(201);
    const { idObjeto } = await objectResponse.json();
    await player.goto('/objects');
    await player.getByRole('button', { name: /Arco E2E/ }).click();
    await player.getByRole('button', { name: 'Comprar objeto', exact: true }).click();
    await player.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
    await expect(player.getByRole('status')).toHaveText('Compra realizada con éxito. Saldo restante: $160.');

    await player.goto('/inventory');
    await player.getByRole('button', { name: 'Crear', exact: true }).click();
    const characterSelect = player.getByRole('combobox', { name: 'Personaje', exact: true });
    const characterId = await characterSelect.locator('option').filter({ hasText: 'Arwen E2E' }).getAttribute('value');
    await characterSelect.selectOption(characterId!);
    await player.getByLabel('Número de inventario', { exact: true }).fill('2');
    await player.getByLabel('Capacidad', { exact: true }).fill('3');
    await player.getByRole('button', { name: 'Guardar', exact: true }).click();
    const inventoryRow = player.locator('tbody tr').filter({ has: player.locator('td:nth-child(2)', { hasText: /^2$/ }) });
    await inventoryRow.getByRole('button', { name: 'Ver detalle' }).click();
    await player.getByLabel('Objeto del personaje', { exact: true }).fill(String(idObjeto));
    await player.getByRole('combobox', { name: /^Posición destino/ }).selectOption('2');
    await player.getByRole('button', { name: 'Mover objeto', exact: true }).click();
    await expect(player.getByRole('heading', { name: 'Detalle', exact: true })).toHaveCount(0);
    await inventoryRow.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(player.locator('.grid-posiciones > div').filter({ hasText: 'Casillero #2' })).toContainText('Arco E2E');
    await player.getByRole('combobox', { name: 'Objeto a vender', exact: true }).selectOption(String(idObjeto));
    await player.getByRole('spinbutton', { name: /^Precio/ }).fill('28');
    await player.getByRole('combobox', { name: 'Tienda receptora', exact: true }).selectOption({ label: '🏪 Armería E2E' });
    await player.getByRole('button', { name: 'Vender objeto', exact: true }).click();
    await expect(player.getByRole('heading', { name: 'Detalle', exact: true })).toHaveCount(0);
    await inventoryRow.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(player.getByRole('combobox', { name: 'Objeto a vender', exact: true }).locator('option', { hasText: 'Arco E2E' })).toHaveCount(0);
    await player.goto('/characters');
    await expect(stats.locator('.stat-item').filter({ hasText: 'Dinero' }).locator('.stat-val')).toHaveText('🪙 188');
  } finally {
    await player.close();
  }
});
