/**
 * Teste de ponta a ponta da plataforma: site, portal do paciente, portal do
 * profissional e painel da administração, no computador e no celular.
 *
 * Roda contra um servidor local e um banco LOCAL — ele apaga e recria os
 * dados de demonstração, então se recusa a rodar se DATABASE_URL apontar
 * para outro lugar.
 *
 *   npm run build && npm start        (em outro terminal)
 *   npm run test:e2e
 *
 * BASE_URL muda o endereço do servidor (padrão http://localhost:3000).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync } = require("node:child_process");

// .env sem depender de biblioteca: só o que o teste precisa
const raiz = path.join(__dirname, "..");
const arquivoEnv = path.join(raiz, ".env");
const linhasEnv = fs.existsSync(arquivoEnv)
  ? fs.readFileSync(arquivoEnv, "utf8").split("\n")
  : [];
for (const linha of linhasEnv) {
  const m = linha.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const banco = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(banco)) {
  console.error("Recusado: DATABASE_URL não é um banco local. Este teste apaga dados.");
  process.exit(2);
}

const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const B = process.env.BASE_URL ?? "http://localhost:3000";

/** Base limpa: o que o seed não zera é apagado aqui antes de ele rodar. */
async function prepararBase() {
  await db.voucher.deleteMany();
  await db.lancamentoClube.deleteMany();
  await db.destaque.deleteMany();
  await db.arquivo.deleteMany();
  execSync("npm run db:seed", { cwd: raiz, stdio: "ignore" });
}
const R = []; // resultados
const ok = (nome, cond, extra='') => { R.push([cond ? 'PASS' : 'FAIL', nome, extra]); };
let browser; const erros = [];
async function nova(w=1280,h=900){ const c=await browser.newContext({viewport:{width:w,height:h}}); const p=await c.newPage();
  p.on('pageerror',e=>erros.push(p.url()+' :: '+e)); p.on('console',m=>{ if(m.type()==='error' && !/favicon/.test(m.text())) erros.push(p.url()+' :: '+m.text())}); return p; }
async function login(p,e,s){ await p.goto(B+'/entrar'); await p.fill('#email',e); await p.fill('#senha',s); await Promise.all([p.waitForURL(u=>!u.pathname.startsWith('/entrar'),{timeout:15000}).catch(()=>{}), p.click('button[type=submit]')]); }
async function visitar(p, path, mobile=false){
  const r = await p.goto(B+path); await p.waitForLoadState('networkidle').catch(()=>{});
  const largura = await p.evaluate(()=>document.documentElement.scrollWidth);
  return { status: r.status(), url: new URL(p.url()).pathname, largura };
}

(async () => {
  await prepararBase();
  browser = await chromium.launch();
  const sofia = await db.paciente.findFirst({ where:{ usuario:{ email:'sofia@exemplo.com' } }, include:{usuario:true} });
  const kleber = await db.profissional.findFirst({ where:{ usuario:{ email:'kleber@vitapraxis.com.br' } } });

  // ---------- A. Páginas públicas (desktop e celular)
  const publicas = ['/', '/quem-somos', '/kleber-fontolan', '/especialidades', '/clube', '/galeria', '/vale-presente', '/contato', '/entrar'];
  for (const [w,h,rot] of [[1280,900,'desktop'],[390,844,'celular']]) {
    const p = await nova(w,h);
    for (const path of publicas) { const v = await visitar(p,path); ok(`Público ${rot} ${path}`, v.status===200 && v.largura<=w, `status ${v.status}, largura ${v.largura}`); }
  }

  // ---------- B. Matriz de acesso
  const anon = await nova();
  for (const path of ['/app','/pro','/admin','/trocar-senha']) { const v = await visitar(anon,path); ok(`Sem login ${path} → /entrar`, v.url==='/entrar'); }
  const pac = await nova(); await login(pac,'sofia@exemplo.com','vitapraxis');
  const pro = await nova(); await login(pro,'kleber@vitapraxis.com.br','vitapraxis');
  const adm = await nova(); await login(adm,'admin@vitapraxis.com.br','vitapraxis');
  const matriz = [[pac,'Paciente','/app',['/admin','/pro']],[pro,'Profissional','/pro',['/admin','/app']],[adm,'Admin','/admin',['/pro','/app']]];
  for (const [p,nome,casa,proibidas] of matriz) {
    ok(`${nome} entra e cai em ${casa}`, new URL(p.url()).pathname===casa, p.url());
    for (const x of proibidas) { const v = await visitar(p,x); ok(`${nome} tentando ${x} volta para ${casa}`, v.url===casa, v.url); }
  }
  // senha errada
  const ruim = await nova(); await ruim.goto(B+'/entrar'); await ruim.fill('#email','sofia@exemplo.com'); await ruim.fill('#senha','errada'); await ruim.click('button[type=submit]');
  await ruim.locator('p[role=alert]').waitFor({timeout:8000}).catch(()=>{});
  ok('Senha errada é recusada', (await ruim.locator('p[role=alert]').allInnerTexts()).join('').includes('incorretos'));
  // redirecionamento externo bloqueado
  await ruim.goto(B+'/entrar?proximo=//exemplo-malicioso.com'); await ruim.fill('#email','sofia@exemplo.com'); await ruim.fill('#senha','vitapraxis');
  await Promise.all([ruim.waitForURL(/localhost/,{timeout:10000}).catch(()=>{}), ruim.click('button[type=submit]')]); await ruim.waitForTimeout(1500);
  ok('Login não redireciona para site externo', new URL(ruim.url()).host==='localhost:3000', ruim.url());

  // ---------- C. Todas as páginas de cada papel, desktop e celular
  const ag = await db.agendamento.findFirst({ where:{ pacienteId: sofia.id } });
  const paginas = {
    Paciente: [pac, ['/app','/app/agendamentos','/app/agendamentos/registrar','/app/agendamentos/solicitar','/app/servicos','/app/equipe','/app/evolucao','/app/bem-estar','/app/biblioteca','/app/beneficios','/app/pacotes','/app/perfil','/app/atendimento','/app/feedback','/trocar-senha']],
    Profissional: [pro, ['/pro','/pro/pacientes','/pro/pacientes?q=sofia',`/pro/pacientes/${sofia.id}`,`/pro/pacientes/${sofia.id}/atender`,'/pro/atendimentos','/trocar-senha']],
    Admin: [adm, ['/admin','/admin/sessoes','/admin/pacientes','/admin/pacientes/novo',`/admin/pacientes/${sofia.id}`,'/admin/servicos','/admin/equipe','/admin/destaques','/admin/biblioteca','/admin/feedback','/admin/vales','/admin/vouchers','/admin/sorteios','/admin/mensagens','/admin/configuracoes','/trocar-senha']],
  };
  for (const [nome,[p,lista]] of Object.entries(paginas)) {
    for (const path of lista) { const v = await visitar(p,path); ok(`${nome} desktop ${path}`, v.status===200 && v.largura<=1280, `status ${v.status}`); }
    const m = await nova(390,844); const cred = {Paciente:['sofia@exemplo.com','vitapraxis'],Profissional:['kleber@vitapraxis.com.br','vitapraxis'],Admin:['admin@vitapraxis.com.br','vitapraxis']}[nome];
    await login(m,...cred);
    for (const path of lista) { const v = await visitar(m,path); ok(`${nome} celular ${path}`, v.status===200 && v.largura<=390, `largura ${v.largura}`); }
  }

  // ---------- D. Regras: indicação 10%, pontos sem duplicar, profissional registra
  await adm.goto(B+'/admin/pacientes/novo');
  await adm.fill('#nome','Teste Indicado Silva'); await adm.fill('#email','indicado@teste.com'); await adm.fill('#whatsapp','(51) 97777-6666');
  await adm.fill('#indicadoPor', sofia.codigoIndicacao); await adm.click('button:has-text("Cadastrar paciente")');
  await adm.locator('text=Paciente cadastrado').waitFor({timeout:10000});
  const senhaProv = (await adm.locator('dd.font-mono').innerText()).trim();
  ok('Senha provisória no formato xxxxx-xxxxx', /^[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/.test(senhaProv), senhaProv);
  ok('Link de WhatsApp com a mensagem de acesso', (await adm.locator('a:has-text("Enviar pelo WhatsApp")').getAttribute('href')).includes('wa.me/5551977776666'));
  const novo = await db.paciente.findFirst({ where:{ usuario:{ email:'indicado@teste.com' } }, include:{ usuario:true } });
  ok('Paciente criado com troca de senha obrigatória', novo.usuario.trocarSenha === true);
  ok('Indicação ficou pendente', !!(await db.indicacao.findFirst({ where:{ indicadoId: novo.id, status:'PENDENTE' } })));

  const servico = await db.servico.findFirst({ where:{ profissionais:{ some:{ id: kleber.id } } } });
  const cashAntes = (await db.paciente.findUnique({ where:{ id: sofia.id } })).cashback;
  async function atender(pacienteId, regioes=[]) {
    await pro.goto(`${B}/pro/pacientes/${pacienteId}/atender`);
    if (await pro.locator('#agendamentoId option').count() > 1) await pro.selectOption('#agendamentoId','');
    await pro.selectOption('#servicoId', servico.id);
    for (const r of regioes) await pro.click(`[aria-label="${r}"]`);
    await pro.fill('#conduta','Ajuste lombar e liberação.'); await pro.fill('#evolucao','Melhora parcial da dor.');
    await Promise.all([pro.waitForURL(/registrado=1/,{timeout:15000}), pro.click('button:has-text("Registrar atendimento")')]);
  }
  await atender(novo.id, ['Coluna lombar']);
  const sofiaDepois = await db.paciente.findUnique({ where:{ id: sofia.id } });
  const esperado = Math.round(servico.precoAvulso*10)/100;
  ok(`Indicação paga 10% da 1ª sessão (R$ ${esperado})`, Math.abs(sofiaDepois.cashback - cashAntes - esperado) < 0.001, `antes ${cashAntes}, depois ${sofiaDepois.cashback}`);
  ok('Voucher de crédito da indicação criado', !!(await db.voucher.findFirst({ where:{ pacienteId: sofia.id, tipo:'INDICACAO', valor: esperado } })));
  const pts1 = (await db.paciente.findUnique({ where:{ id: novo.id } })).pontos;
  ok('1ª sessão: bônus de cadastro + pontos da sessão', pts1 === 500 + (servico.pontos ?? 100), `pontos ${pts1}`);
  await atender(novo.id);
  const pts2 = (await db.paciente.findUnique({ where:{ id: novo.id } })).pontos;
  const cash2 = (await db.paciente.findUnique({ where:{ id: sofia.id } })).cashback;
  ok('2ª sessão: só os pontos da sessão, sem bônus repetido', pts2 === pts1 + (servico.pontos ?? 100), `pontos ${pts2}`);
  ok('2ª sessão: indicação não paga de novo', Math.abs(cash2 - sofiaDepois.cashback) < 0.001);
  const evs = await db.evolucao.findMany({ where:{ pacienteId: novo.id }, include:{ agendamento:true } });
  ok('Atendimentos viraram sessões concluídas com o profissional', evs.length===2 && evs.every(e=>e.agendamento.status==='CONCLUIDO' && e.profissionalId===kleber.id));
  ok('Região marcada foi gravada', evs.some(e=>e.regioesDor==='lombar'));
  // admin tentar concluir de novo não duplica
  const lancs = await db.lancamentoClube.count({ where:{ pacienteId: novo.id } });
  await adm.goto(B+'/admin/sessoes');
  ok('Sessões já concluídas não aparecem para confirmar de novo', (await adm.locator('li', {hasText:'Teste Indicado'}).count())===0);
  ok('Extrato com 3 lançamentos (bônus + 2 sessões)', lancs===3, `lançamentos ${lancs}`);

  // ---------- E. Paciente novo: troca obrigatória, questionário com boneco, profissional vê
  const np = await nova(390,844); await login(np,'indicado@teste.com',senhaProv);
  ok('Primeiro acesso cai na troca de senha', new URL(np.url()).pathname==='/trocar-senha');
  await np.goto(B+'/app'); ok('Sem trocar a senha, não entra no portal', new URL(np.url()).pathname==='/trocar-senha');
  await np.goto(B+'/trocar-senha'); await np.fill('#atual',senhaProv); await np.fill('#nova','curta'); await np.fill('#confirmacao','curta'); await np.click('button[type=submit]');
  await np.waitForTimeout(800); ok('Senha curta é recusada', new URL(np.url()).pathname==='/trocar-senha');
  await np.fill('#atual',senhaProv); await np.fill('#nova','NovaSenha123'); await np.fill('#confirmacao','NovaSenha123');
  await Promise.all([np.waitForURL(/\/app/), np.click('button[type=submit]')]);
  ok('Troca de senha leva ao portal', new URL(np.url()).pathname==='/app');
  const velho = await nova(); await velho.goto(B+'/entrar'); await velho.fill('#email','indicado@teste.com'); await velho.fill('#senha',senhaProv); await velho.click('button[type=submit]'); await velho.waitForTimeout(1500);
  ok('Senha provisória deixa de valer', new URL(velho.url()).pathname==='/entrar');
  await np.goto(B+'/app/bem-estar');
  for (const l of ['Bom','Bom','Boa','7 – 8']) { await np.click(`button[role=radio]:has-text("${l}")`); await np.click('button:has-text("Continuar")'); }
  await np.click('[aria-label="Ombro direito(a)"]'); await np.click('[aria-label="Coluna cervical"]'); await np.click('[aria-label="Coluna cervical"]');
  await np.click('button:has-text("Continuar")'); await np.click('button:has-text("Voltar")');
  ok('Marcação do boneco persiste ao voltar no questionário', (await np.locator('text=Ombro direito(a)').count())>0 && (await np.locator('figure p, p:has-text("Coluna cervical")').filter({hasText:'Coluna cervical'}).count())===0);
  await np.click('button:has-text("Continuar")'); await np.click('button[role=radio]:has-text("Ainda não")'); await np.click('button:has-text("Enviar respostas")');
  await np.locator('text=Respostas enviadas').waitFor({timeout:10000});
  const idx = await db.indiceBemEstar.findFirst({ where:{ pacienteId: novo.id }, orderBy:{ respondidoEm:'desc' } });
  ok('Questionário grava regiões do paciente', idx?.regioesDor==='ombro-dir', idx?.regioesDor);
  await pro.goto(`${B}/pro/pacientes/${novo.id}`);
  ok('Profissional vê "Marcado pelo paciente"', (await pro.locator('text=Marcado pelo paciente').count())===1);
  await pro.goto(`${B}/pro/pacientes/${novo.id}/atender`);
  ok('Atendimento já vem com o boneco do paciente', (await pro.locator('input[name=regioesDor]').inputValue())==='ombro-dir');
  ok('Atendimento já vem com a dor do paciente', (await pro.locator('input[name=dor]').inputValue())==='8');

  // ---------- F. Profissional: só edita a própria evolução; fora da equipe perde acesso
  const outroPro = await db.profissional.findFirst({ where:{ id:{ not: kleber.id }, ativo:true } });
  const agOutro = await db.agendamento.create({ data:{ pacienteId: novo.id, profissionalId: outroPro.id, servicoId: servico.id, inicio: new Date(), duracaoMin: 60, status:'CONCLUIDO' } });
  await db.evolucao.create({ data:{ agendamentoId: agOutro.id, pacienteId: novo.id, profissionalId: outroPro.id, conduta:'x outro', evolucao:'evolucao de outro profissional' } });
  await pro.goto(`${B}/pro/pacientes/${novo.id}`);
  ok('Vê evolução de colega', (await pro.locator('text=evolucao de outro profissional').count())===1);
  ok('Só aparece "Editar" nas próprias evoluções', (await pro.locator('button:has-text("Editar evolução")').count())===2);
  await adm.goto(B+'/admin/equipe');
  await adm.locator('li', {hasText:'Kleber Fontolan'}).first().locator('button:has-text("Tirar da equipe")').click(); await adm.locator('li', {hasText:'Kleber Fontolan'}).first().locator('button:has-text("Trazer de volta")').waitFor();
  await pro.goto(B+'/pro'); ok('Profissional fora da equipe vê "Acesso indisponível"', (await pro.locator('text=Acesso indisponível').count())===1);
  await adm.goto(B+'/admin/equipe'); await adm.locator('li', {hasText:'Kleber Fontolan'}).first().locator('button:has-text("Trazer de volta")').click(); await adm.locator('li', {hasText:'Kleber Fontolan'}).first().locator('button:has-text("Tirar da equipe")').waitFor();
  await pro.goto(B+'/pro'); ok('Volta a ter acesso ao retornar à equipe', (await pro.locator('text=Acesso indisponível').count())===0);

  // ---------- G. Admin: nova senha derruba sessões
  await adm.goto(`${B}/admin/pacientes/${novo.id}`); await adm.click('button:has-text("Gerar nova senha")');
  await adm.locator('dd.font-mono').waitFor({timeout:10000});
  await np.goto(B+'/app'); ok('Gerar nova senha desconecta o paciente', new URL(np.url()).pathname==='/entrar');

  // ---------- H. Serviços: validação e exibição de preço
  await adm.goto(B+'/admin/servicos');
  const card = adm.locator('form').filter({ has: adm.locator(`input[name=id][value="${servico.id}"]`) });
  const av = servico.precoAvulso;
  await card.locator('input[name=precoPromocional]').fill(String(av+10)); await card.locator('button[type=submit]').click(); await card.locator('[role=alert]').waitFor({timeout:10000}).catch(()=>{});
  ok('Promocional maior que avulso é recusado', (await card.locator('[role=alert]').count())===1);
  await card.locator('input[name=precoPromocional]').fill(String(Math.floor(av*0.7))); await card.locator('button[type=submit]').click(); await card.locator('[role=status]').waitFor();
  await pac.goto(B+'/app/servicos'); const art = pac.locator('article', {hasText: servico.nome}).first();
  ok('Paciente vê promoção com valor riscado', (await art.locator('text=Promoção').count())===1 && (await art.locator('.line-through').count())===1);
  await card.locator('input[name=exibirPreco]').uncheck(); await card.locator('input[name=exibirPromocional]').uncheck(); await card.locator('button[type=submit]').click(); for (let i=0;i<40 && (await db.servico.findUnique({where:{id:servico.id}})).exibirPreco;i++) await adm.waitForTimeout(250);
  await pac.goto(B+'/app/servicos');
  ok('Com as caixas desmarcadas, o paciente não vê preço', (await pac.locator('article', {hasText: servico.nome}).first().locator('text=por sessão').count())===0);

  // ---------- I. Vouchers: aniversário só no mês; campanha por faixa; não duplica
  const hoje = new Date();
  await db.paciente.update({ where:{ id: novo.id }, data:{ dataNascimento: new Date(1990, hoje.getMonth(), 15) } });
  await adm.goto(B+'/admin/vouchers'); await adm.click('button:has-text("Emitir aniversários do mês")'); for (let i=0;i<40 && !(await db.voucher.count({where:{pacienteId:novo.id,tipo:'ANIVERSARIO'}}));i++) await adm.waitForTimeout(250);
  await adm.click('button:has-text("Emitir aniversários do mês")'); await adm.waitForLoadState('networkidle'); await adm.waitForTimeout(1500);
  const vAniv = await db.voucher.findMany({ where:{ pacienteId: novo.id, tipo:'ANIVERSARIO' } });
  const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1), fim = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0);
  ok('Voucher de aniversário emitido uma vez só', vAniv.length===1, `${vAniv.length}`);
  ok('Vale do 1º ao último dia do mês do aniversário', vAniv[0] && vAniv[0].validoDe.getDate()===1 && vAniv[0].validoDe.getMonth()===ini.getMonth() && vAniv[0].validoAte.getDate()===fim.getDate());
  await adm.click('text=Emitir voucher');
  await adm.selectOption('#pacienteId','FAIXA:Diamante'); await adm.fill('#titulo','Teste Diamante'); await adm.fill('#valor','30');
  await adm.click('button:has-text("Emitir voucher")'); await adm.locator('[role=status]').waitFor({timeout:10000}).catch(()=>{});
  const diamantes = (await db.paciente.findMany()).filter(p=>p.pontos>=2000).length;
  const vd = await db.voucher.count({ where:{ titulo:'Teste Diamante' } });
  ok('Campanha por faixa só para quem está na faixa', vd===diamantes, `emitidos ${vd}, na faixa ${diamantes}`);

  // ---------- J. Clube: percentual de indicação validado
  await adm.goto(B+'/admin/configuracoes'); await adm.fill('#indicacaoPercentual','150'); await adm.click('button:has-text("Salvar regras")'); await adm.locator('p[role=alert]').waitFor({timeout:10000}).catch(()=>{});
  ok('Percentual de indicação acima de 100% é recusado', (await adm.locator('p[role=alert]').count())>=1);
  await adm.goto('about:blank');

  // ---------- K. Ofertas: enviar imagem não salva o cartão por engano
  const png = path.join(os.tmpdir(), 'vitapraxis-teste.png'); await adm.goto(B+'/'); await adm.screenshot({path: png, clip:{x:0,y:0,width:600,height:300}});
  const cartoesAntes = await db.destaque.count(); const arqAntes = await db.arquivo.count();
  await adm.goto(B+'/admin/destaques');
  await adm.locator('input[type=file]').first().setInputFiles(png);
  await adm.locator('button:has-text("Enviar")').first().click(); for (let i=0;i<40 && (await db.arquivo.count())===arqAntes;i++) await adm.waitForTimeout(250); await adm.waitForTimeout(1000);
  ok('Upload de imagem grava o arquivo', (await db.arquivo.count())===arqAntes+1);
  ok('Upload de imagem não cria cartão sozinho', (await db.destaque.count())===cartoesAntes);

  ok('Nenhum erro de JavaScript nas páginas', erros.length===0, erros.slice(0,5).join(' || '));
  await browser.close(); await db.$disconnect();
  const falhas = R.filter(r=>r[0]==='FAIL');
  for (const r of R) if (r[0]==='FAIL') console.log('FAIL |', r[1], '|', r[2]);
  console.log(`\n${R.length-falhas.length}/${R.length} passaram`);
  process.exit(falhas.length ? 1 : 0);
})().catch(async e=>{ console.error('ERRO', e); for (const r of R) if (r[0]==='FAIL') console.log('FAIL |', r[1], '|', r[2]); console.log(`${R.filter(r=>r[0]==='PASS').length} passaram antes do erro`); process.exit(1); });
