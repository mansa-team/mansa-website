import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the editorial journey and real project stage are accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clareza para');
  await expect(
    page.getByRole('heading', { name: 'Uma ideia com trabalho por trás.' }),
  ).toBeVisible();
  await expect(page.getByText('David Rangel', { exact: true })).toBeVisible();
  await expect(page.getByText('Heitor Rosa', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Converse sobre o projeto' })).toHaveAttribute(
    'href',
    '/contato/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(errors).toEqual([]);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('principles stay readable and index links work with the keyboard', async ({ page }) => {
  await page.goto('/');
  const index = page.getByRole('navigation', { name: 'Princípios da Mansa' });
  const link = index.getByRole('link', { name: 'Constância' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#principio-constancia$/);
  for (const heading of [
    'Entender antes de decidir.',
    'Dar espaço ao longo prazo.',
    'Aprender durante o caminho.',
  ]) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-principle-panel][hidden]')).toHaveCount(0);
});

test('manual theme persists and changes the reading surfaces', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Aparência do site').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Converse sobre o projeto' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Aparência do site').selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('automatic theme follows local 18h boundary without overriding manual choice', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-04T17:59:30') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.clock.fastForward(60001);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Aparência do site').selectOption('light');
  await page.clock.fastForward(60001);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('automatic theme returns to daytime at the local 6h boundary', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-13T05:59:30') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.clock.fastForward(60001);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme works even when local storage is unavailable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage unavailable');
      },
    }),
  );
  await page.goto('/');
  await page.getByLabel('Aparência do site').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('reduced motion keeps the home illustration and all principles available', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Converse sobre o projeto' })).toBeVisible();
});

test('a device without WebGL retains the home illustration and complete reading', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: any[]) {
      if (String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args as any);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Converse sobre o projeto' })).toBeVisible();
});

for (const width of [320, 375, 414, 768, 1024, 1920]) {
  test(`composition has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of [
      '/',
      '/contato/',
      '/privacidade/',
      '/estudo/',
      '/estudo/clareza/',
      '/estudo/camadas/',
    ]) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(overflow.scroll, `${path} overflows`).toBeLessThanOrEqual(overflow.width + 1);
    }
  });
}

test('mobile navigation closes with Escape and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByLabel('Abrir navegação');
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Navegação móvel' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Navegação móvel' })).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .getByRole('navigation', { name: 'Navegação móvel' })
    .getByRole('link', { name: 'Nossa proposta' })
    .click();
  await expect(page.getByRole('navigation', { name: 'Navegação móvel' })).toBeHidden();
});

test('no JavaScript still exposes the whole narrative and contact route', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Aprender durante o caminho.' })).toBeVisible();
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
  await expect(page.locator('#pesquisa')).toContainText('Em desenvolvimento');
  await page.getByRole('link', { name: 'Converse sobre o projeto' }).click();
  await expect(page.locator('form')).toHaveAttribute('action', 'mailto:mansafin.team@gmail.com');
  await expect(page.getByRole('link', { name: 'mansafin.team@gmail.com' }).first()).toBeVisible();
  await context.close();
});

test('contact and privacy pass automated accessibility checks', async ({ page }) => {
  for (const path of ['/contato/', '/privacidade/', '/404.html']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});

test('night reading surfaces also pass contrast and accessibility checks', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mansa-theme', 'dark'));
  for (const path of ['/', '/contato/', '/privacidade/']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});

test('save-data retains the home illustration and complete reading', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    }),
  );
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
});

test('draft preparation preserves fields and never claims delivery', async ({ page }) => {
  await page.goto('/contato/');
  await page.getByLabel('Seu nome').fill('Pessoa de teste');
  await page.getByLabel('E-mail', { exact: false }).first().fill('teste@example.com');
  await page.getByLabel('Tenho interesse em').selectOption('Parceria');
  await page
    .getByLabel('Sua mensagem')
    .fill('Gostaria de conversar sobre uma parceria com a Mansa.');
  await page.getByRole('button', { name: 'Preparar conversa por e-mail' }).click();
  await expect(page.getByRole('status')).toContainText('confirme o envio por lá');
  await expect(page.getByLabel('Seu nome')).toHaveValue('Pessoa de teste');
  await expect(page.getByRole('status')).not.toContainText('recebida');
});

test('configured form handles rejection and confirmed acceptance without real submissions', async ({
  page,
}) => {
  await page.goto('/contato/');
  await page.evaluate(() => {
    const form = document.querySelector<HTMLFormElement>('form')!;
    form.dataset.configured = 'true';
    form.action = 'https://formspree.io/f/testform';
  });
  await page.getByLabel('Seu nome').fill('Pessoa de teste');
  await page.getByLabel('E-mail', { exact: false }).first().fill('teste@example.com');
  await page.getByLabel('Tenho interesse em').selectOption('Parceria');
  await page.getByLabel('Sua mensagem').fill('Mensagem de teste de entrega interceptada.');
  await page.route('https://formspree.io/f/testform', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"mock"}' }),
  );
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('status')).toContainText('Não foi possível confirmar');
  await expect(page.getByLabel('Sua mensagem')).toHaveValue(
    'Mensagem de teste de entrega interceptada.',
  );
  await page.unroute('https://formspree.io/f/testform');
  await page.route('https://formspree.io/f/testform', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('status')).toContainText('Sua mensagem foi recebida');
  await expect(page.getByLabel('Sua mensagem')).toHaveValue('');
});

test('unknown URLs receive a real 404 and a useful return route', async ({ page }) => {
  const response = await page.goto('/pagina-que-nao-existe/');
  expect(response?.status()).toBe(404);
  await page.getByRole('link', { name: 'Voltar para a Mansa' }).click();
  await expect(page).toHaveURL('/');
});

test('desktop smoothing yields to native reading when reduced motion changes at runtime', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.locator('#principio-constancia').scrollIntoViewIfNeeded();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('canvas')).toHaveCount(0);
  const link = page
    .getByRole('navigation', { name: 'Princípios da Mansa' })
    .getByRole('link', { name: 'Compreensão' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#principio-compreensao$/);
  await expect(link).toHaveAttribute('aria-current', 'location');
  await expect(page.getByRole('heading', { name: 'Aprender durante o caminho.' })).toBeInViewport();
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
  await expect(page.locator('[data-principle-panel][hidden]')).toHaveCount(0);
});

test('mobile principles are a complete vertical narrative with native scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const name of [
    'Entender antes de decidir.',
    'Dar espaço ao longo prazo.',
    'Aprender durante o caminho.',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('canvas')).toHaveCount(0);
});

for (const [linkName, interest] of [
  ['Investir no projeto', 'Investimento no projeto'],
  ['Construir uma parceria', 'Parceria'],
  ['Apoiar o desenvolvimento', 'Apoio ao desenvolvimento'],
]) {
  test(`participation link preselects ${interest} in contact`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('link', { name: linkName, exact: true }).click();
    await expect(page.getByLabel('Tenho interesse em')).toHaveValue(interest);
    await expect(page.locator('form')).toHaveAttribute('action', 'mailto:mansafin.team@gmail.com');
  });
}

test('returning home preserves a single continuous chapter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Converse sobre o projeto', exact: true }).click();
  await page.getByRole('link', { name: 'Mansa — início', exact: true }).first().click();
  await expect(page.locator('[data-principles]')).toHaveCount(1);
  await expect(page.locator('[data-principle-panel]')).toHaveCount(3);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

async function fillDraft(page: import('@playwright/test').Page) {
  await page.goto('/contato/?interesse=Parceria');
  await page.getByLabel('Seu nome').fill('Pessoa de teste');
  await page.getByLabel('E-mail', { exact: false }).first().fill('teste@example.com');
  await page
    .getByLabel('Sua mensagem')
    .fill('Gostaria de conversar sobre uma parceria com a Mansa.');
}

test('copying a contact draft preserves the fields and performs no submission', async ({
  page,
}) => {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          (window as any).__copiedDraft = text;
        },
      },
      configurable: true,
    }),
  );
  await fillDraft(page);
  await page.getByRole('button', { name: 'Copiar mensagem' }).click();
  await expect(page.getByRole('status')).toContainText('Mensagem copiada');
  await expect(page.getByRole('status')).toBeFocused();
  expect(await page.evaluate(() => (window as any).__copiedDraft)).toContain(
    'Assunto: Mansa — Parceria',
  );
  await expect(page.getByLabel('Seu nome')).toHaveValue('Pessoa de teste');
  expect(posts).toEqual([]);
});

test('unavailable clipboard exposes a selectable accessible manual draft', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Denied');
        },
      },
      configurable: true,
    }),
  );
  await fillDraft(page);
  await page.getByRole('button', { name: 'Copiar mensagem' }).click();
  const draft = page.getByLabel('Mensagem preparada para copiar');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue(/Para: mansafin.team@gmail.com/);
  await expect(draft).toHaveValue(/Gostaria de conversar/);
  await expect(page.getByLabel('Seu nome')).toHaveValue('Pessoa de teste');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('mission, project stage and invitation are visible together on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'Converse sobre o projeto' });
  await expect(page.locator('.hero-stage')).toContainText('Um projeto em desenvolvimento.');
  await expect(page.locator('.hero-audience')).toContainText(
    'investidores no projeto, parceiros e apoiadores',
  );
  await expect(page.locator('.hero-copy')).toContainText('classe média brasileira');
  expect(await cta.evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(844);
});

test('layer study works with keyboard and respects a static reduced-motion presentation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/estudo/camadas/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  const control = page.getByRole('slider', { name: 'Aproximar as camadas' });
  await expect(control).toBeEnabled();
  await control.focus();
  await expect(control).toBeFocused();
  await page.keyboard.press('End');
  await expect(control).toHaveAttribute('aria-valuetext', '100 por cento — Horizonte');
  await page.keyboard.press('Home');
  await expect(control).toHaveAttribute('aria-valuetext', '0 por cento — Matéria');
  await expect(page.locator('.layer-field canvas')).toHaveCount(0);
  await expect(page.locator('.layer-field .sculpture-poster')).toBeVisible();
  await page.getByRole('radio', { name: 'Linhas 2D' }).check();
  await expect(page.locator('.layer-field span').first()).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('heading', { name: 'Continuidade', exact: true })).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('enlarged text remains readable with no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/contato/']) {
    await page.goto(path);
    await page.evaluate(() => {
      for (const el of document.querySelectorAll<HTMLElement>(
        'h1,h2,h3,p,label,.eyebrow,.founders span,a,button',
      )) {
        el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * 2}px`;
      }
    });
    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll<HTMLElement>('body *')]
        .filter(
          (el) =>
            el.getBoundingClientRect().right > innerWidth + 1 &&
            getComputedStyle(el).position !== 'absolute',
        )
        .map((el) => ({
          tag: el.tagName,
          class: el.className,
          right: el.getBoundingClientRect().right,
        })),
    }));
    expect(
      overflow.width,
      JSON.stringify({ path, elements: overflow.elements }),
    ).toBeLessThanOrEqual(769);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('public research is presented with its development status and verifiable sources', async ({
  page,
}) => {
  await page.goto('/#pesquisa');
  const research = page.locator('#pesquisa');
  for (const [title, status] of [
    ['Dados que encontram contexto.', 'Em desenvolvimento'],
    ['Pesquisa que vira ferramenta.', 'Em pesquisa'],
    ['Uma visão de conjunto.', 'Em desenvolvimento'],
  ]) {
    const article = research.getByRole('article').filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    });
    await expect(article).toContainText(status);
  }
  await expect(research).toContainText('A experiência para o público ainda precisa ser validada');
  await expect(research.getByRole('link', { name: 'Conhecer a base de pesquisa' })).toHaveAttribute(
    'href',
    'https://github.com/mansa-team/musa#readme',
  );
  await expect(
    research.getByRole('link', { name: 'Consultar a estrutura técnica' }),
  ).toHaveAttribute('href', 'https://github.com/mansa-team/server#readme');
});
