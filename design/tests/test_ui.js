const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('file:///workspace/moxsh-ui-5styles.html');
  await page.waitForTimeout(400);

  const results = [];
  const ok = (n, c) => results.push((c ? 'PASS' : 'FAIL') + ' · ' + n);

  // 0. 默认主题为白色 A（iOS 原生白底）
  ok('默认主题为白色 A', (await page.getAttribute('html', 'data-theme')) === 'a');

  // 1. 五主题切换
  for (const th of ['a','b','c','d','e']) {
    await page.click(`.style-btn[data-pick="${th}"]`);
    await page.waitForTimeout(60);
    const t = await page.getAttribute('html', 'data-theme');
    ok('主题切换 → ' + th, t === th);
  }
  await page.click('.style-btn[data-pick="d"]');

  // 2. 三键切换视图（终端 / 分类 / 设置）
  for (const v of ['v-terminal','v-categories','v-settings','v-terminal']) {
    await page.click(`.tab[data-view="${v}"]`);
    await page.waitForTimeout(60);
    const on = await page.$eval('#' + v, el => el.classList.contains('on'));
    ok('三键切视图 → ' + v, on);
  }

  // 3. 终端命令
  await page.fill('#term-in', 'help');
  await page.press('#term-in', 'Enter');
  await page.waitForTimeout(60);
  let out = await page.textContent('#term-out');
  ok('终端 help 输出', /可用/.test(out));

  await page.fill('#term-in', 'whoami');
  await page.press('#term-in', 'Enter');
  await page.waitForTimeout(60);
  out = await page.textContent('#term-out');
  ok('终端 whoami → mox', /mox/.test(out));

  await page.fill('#term-in', 'bogus');
  await page.press('#term-in', 'Enter');
  await page.waitForTimeout(60);
  out = await page.textContent('#term-out');
  ok('未知命令报错', /command not found/.test(out));

  // 4. 连点三下切会话（会话收进终端，仍可用手势）
  const box = await page.$eval('.term-wrap', el => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  const cx = box.x + box.w/2, cy = box.y + 40;
  const before = await page.textContent('#term-sess');
  for (let i=0;i<3;i++){ await page.mouse.click(cx, cy); await page.waitForTimeout(80); }
  await page.waitForTimeout(120);
  const after = await page.textContent('#term-sess');
  ok('连点三下切会话', before !== after && /构建|远程/.test(after));

  // 5. 左右滑切会话（左滑=下一）
  const sessBefore = await page.textContent('#term-sess');
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i=1;i<=6;i++) await page.mouse.move(cx - i*20, cy);
  await page.mouse.up();
  await page.waitForTimeout(120);
  const sessAfter = await page.textContent('#term-sess');
  ok('左滑切会话', sessBefore !== sessAfter);

  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i=1;i<=6;i++) await page.mouse.move(cx + i*20, cy);
  await page.mouse.up();
  await page.waitForTimeout(120);
  ok('右滑切会话', (await page.textContent('#term-sess')) !== sessAfter);

  // 6. 会话抽屉（点工具栏「≡ 会话」）
  await page.click('#sessBtn');
  await page.waitForTimeout(200);
  const sheetOpen = await page.$eval('#sessSheet', el => el.classList.contains('open'));
  const sessCount = await page.$$eval('#ss-list .sess', els => els.length);
  ok('会话抽屉打开', sheetOpen);
  ok('会话列表渲染 3 项', sessCount === 3);
  await page.click('#ssClose');
  await page.waitForTimeout(200);
  ok('会话抽屉可关闭', !(await page.$eval('#sessSheet', el => el.classList.contains('open'))));

  // 7. 上滑唤起 AI
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i=1;i<=6;i++) await page.mouse.move(cx, cy - i*22);
  await page.mouse.up();
  await page.waitForTimeout(480);
  const aiOpen = await page.$eval('#ai', el => el.classList.contains('open'));
  ok('上滑唤起 AI 面板', aiOpen);

  // 8. AI 对话
  await page.fill('#ai-in', '安装 wget');
  await page.click('#ai-send');
  await page.waitForTimeout(120);
  const aiLog = await page.textContent('#ai-log');
  ok('AI 返回命令', /pkg install/.test(aiLog));
  await page.click('.ai-grab');
  await page.waitForTimeout(420);
  ok('AI 面板可关闭', !(await page.$eval('#ai', el => el.classList.contains('open'))));

  // 9. 顶部控制中心：下滑打开（跟随手指）
  const phone = await page.$eval('#phone', el => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  const topX = phone.x + phone.w/2;
  const topY = phone.y + phone.h*0.05;
  await page.mouse.move(topX, topY);
  await page.mouse.down();
  for (let i=1;i<=10;i++) await page.mouse.move(topX, topY + i*22);
  await page.mouse.up();
  await page.waitForTimeout(500);
  const ccOpen = await page.$eval('#cc', el => el.style.transform.includes('translateY(0'));
  ok('顶部下划打开控制中心', ccOpen);

  // 控制中心控件：切主题 / 进插件市场
  await page.click('#ccTheme');
  await page.waitForTimeout(120);
  ok('控制中心切主题', ['a','b','c','d','e'].includes(await page.getAttribute('html','data-theme')));
  await page.click('#ccMarket');
  await page.waitForTimeout(200);
  ok('控制中心「插件」→ 分类页', await page.$eval('#v-categories', el => el.classList.contains('on')));

  // 9b. 侧边音量+ 键（模拟物理键）+ 键盘快捷键 + 小组件
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.$eval('#btn-vol', el => el.click());
  await page.waitForTimeout(500);
  ok('音量+ 键 → 打开控制中心', await page.$eval('#cc', el => el.style.transform.includes('translateY(0')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(420);
  await page.keyboard.press('v'); await page.waitForTimeout(500);
  ok('键盘 V → 打开控制中心', await page.$eval('#cc', el => el.style.transform.includes('translateY(0')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(420);
  const wn = await page.$$eval('.wbtn', els => els.length);
  ok('控制中心含 4 个小组件按钮', wn === 4);
  await page.keyboard.press('?'); await page.waitForTimeout(120);
  ok('键盘 ? 显示快捷键提示', await page.$eval('#kbdTip', el => el.classList.contains('show')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(120);
  ok('键盘 Esc 隐藏快捷键提示', !(await page.$eval('#kbdTip', el => el.classList.contains('show'))));

  // 10. iOS 27 通透度滑块
  const ga0 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ga').trim());
  await page.$eval('#glass-slider', el => { el.value = 0; el.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.waitForTimeout(60);
  const ga1 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ga').trim());
  await page.$eval('#glass-slider', el => { el.value = 100; el.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.waitForTimeout(60);
  const ga2 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ga').trim());
  ok('通透度滑块改变 --ga', parseFloat(ga1) < parseFloat(ga0) && parseFloat(ga2) > parseFloat(ga0));

  // 11. 滚动收标题 + 标签栏收矮（先切回终端页，保证 #term-out 可见）
  await page.click('.tab[data-view="v-terminal"]');
  await page.waitForTimeout(120);
  await page.evaluate(() => {
    const o = document.querySelector('#term-out');
    for (let i=0;i<40;i++){ const d=document.createElement('div'); d.className='term-line muted'; d.textContent='line '+i; o.appendChild(d); }
    o.scrollTop = o.scrollHeight; o.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(80);
  ok('滚动收起大标题', await page.$eval('#v-terminal', el => el.classList.contains('scrolled')));
  ok('标签栏滚动收矮(.min)', await page.$eval('#tabbar', el => el.classList.contains('min')));

  await page.waitForTimeout(100);
  console.log('\n==== 测试结果 ====');
  results.forEach(r => console.log(r));
  console.log('\nJS 错误数: ' + errors.length);
  errors.forEach(e => console.log('  ' + e));
  const failed = results.filter(r => r.startsWith('FAIL')).length;
  console.log('\n通过 ' + (results.length - failed) + '/' + results.length);

  await browser.close();
  process.exit(failed === 0 && errors.length === 0 ? 0 : 1);
})();
