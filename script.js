// Tabela de taxas de câmbio base em BRL (Valores Padrão / Fallback)
const cotacoesAtuais = {
    BRL: 1.0,
    USD: 5.05,
    EUR: 5.42,
    GBP: 6.35,
    JPY: 0.033,
    CAD: 3.72,
    AUD: 3.30,
    CHF: 5.65,
    CNY: 0.70,
    BTC: 429974.00,
    ETH: 18500.00,
    ARS: 0.0058,
    CLP: 0.0054
  };
  
  let chartInstance = null;
  
  // 1. CARREGAR COTAÇÕES DA API AWESOMEAPI
  async function carregarCotacoesAPI() {
    const urlAPI = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL';
  
    try {
      const resposta = await fetch(urlAPI);
      if (!resposta.ok) throw new Error('Falha na requisição da API');
  
      const dados = await resposta.json();
  
      if (dados.USDBRL) cotacoesAtuais.USD = parseFloat(dados.USDBRL.bid);
      if (dados.EURBRL) cotacoesAtuais.EUR = parseFloat(dados.EURBRL.bid);
      if (dados.BTCBRL) cotacoesAtuais.BTC = parseFloat(dados.BTCBRL.bid);
  
      if (dados.USDBRL) atualizarCard('usd', dados.USDBRL);
      if (dados.EURBRL) atualizarCard('eur', dados.EURBRL);
      if (dados.BTCBRL) atualizarCard('btc', dados.BTCBRL);
  
    } catch (erro) {
      console.warn('Erro na API, utilizando dados locais de reserva:', erro);
  
      document.getElementById('val-usd').textContent = cotacoesAtuais.USD.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('val-eur').textContent = cotacoesAtuais.EUR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('val-btc').textContent = cotacoesAtuais.BTC.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } finally {
      renderizarGrafico();
    }
  }
  
  // 2. ATUALIZAR CARDS DA INTERFACE
  function atualizarCard(moedaKey, dados) {
    const elValor = document.getElementById(`val-${moedaKey}`);
    const elBadge = document.getElementById(`badge-${moedaKey}`);
    const cardEl = document.getElementById(`card-${moedaKey}`);
  
    if (elValor && dados.bid) {
      const valor = parseFloat(dados.bid);
      elValor.textContent = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  
    if (elBadge && dados.pctChange) {
      const pct = parseFloat(dados.pctChange);
      const sinal = pct >= 0 ? '+' : '';
      elBadge.textContent = `${sinal}${pct.toFixed(2)}%`;
  
      if (pct >= 0) {
        elBadge.className = 'badge alta';
        if (cardEl) cardEl.className = 'card alta';
      } else {
        elBadge.className = 'badge baixa';
        if (cardEl) cardEl.className = 'card baixa';
      }
    }
  }
  
  // 3. SIMULADOR DE CONVERSÃO
  function configurarSimulador() {
    const formSimulador = document.getElementById('simulador-form');
    const textoResultado = document.getElementById('texto-resultado');
  
    if (!formSimulador) return;
  
    formSimulador.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const valor = parseFloat(document.getElementById('valor-input').value);
      const de = document.getElementById('moeda-origem').value;
      const para = document.getElementById('moeda-destino').value;
  
      if (isNaN(valor) || valor <= 0) {
        textoResultado.style.color = '#dc2626';
        textoResultado.textContent = 'Por favor, insira um valor válido.';
        return;
      }
  
      const taxaDeEmBRL = cotacoesAtuais[de] || 1;
      const taxaParaEmBRL = cotacoesAtuais[para] || 1;
  
      // Regra de conversão: Moeda Origem -> BRL -> Moeda Destino
      const valorEmBRL = valor * taxaDeEmBRL;
      const valorFinal = valorEmBRL / taxaParaEmBRL;
  
      let valorFormatado;
      if (['BTC', 'ETH'].includes(para)) {
        valorFormatado = `${valorFinal.toFixed(6)} ${para}`;
      } else {
        valorFormatado = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: para });
      }
  
      textoResultado.style.color = '#166534';
      textoResultado.style.fontWeight = '600';
      textoResultado.textContent = `${valor.toLocaleString('pt-BR')} ${de} = ${valorFormatado}`;
    });
  }
  
  // 4. CONFIGURAÇÃO DE ALERTAS
  function configurarAlertas() {
    const formAlerta = document.getElementById('alerta-form');
    if (!formAlerta) return;
  
    formAlerta.addEventListener('submit', (e) => {
      e.preventDefault();
      const par = document.getElementById('alerta-moeda').value;
      const limite = document.getElementById('alerta-limite').value;
  
      alert(`Alerta configurado para ${par} no valor limite de R$ ${limite}`);
      formAlerta.reset();
    });
  }
  
  // 5. DESENHAR O GRÁFICO HISTÓRICO
  async function renderizarGrafico() {
    const canvasElement = document.getElementById('meuGrafico');
    if (!canvasElement) return;
  
    let labels = ['6d atrás', '5d atrás', '4d atrás', '3d atrás', '2d atrás', 'Ontem', 'Hoje'];
    let valoresUSD = [5.01, 5.03, 4.98, 5.02, 5.05, 5.00, cotacoesAtuais.USD];
    let valoresEUR = [5.55, 5.58, 5.54, 5.59, 5.62, 5.61, cotacoesAtuais.EUR];
  
    try {
      const [resUSD, resEUR] = await Promise.all([
        fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/7'),
        fetch('https://economia.awesomeapi.com.br/json/daily/EUR-BRL/7')
      ]);
  
      if (resUSD.ok && resEUR.ok) {
        const dadosUSD = await resUSD.json();
        const dadosEUR = await resEUR.json();
  
        if (Array.isArray(dadosUSD) && Array.isArray(dadosEUR) && dadosUSD.length > 0) {
          labels = dadosUSD.map(item => {
            const data = new Date(parseInt(item.timestamp) * 1000);
            return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          }).reverse();
  
          valoresUSD = dadosUSD.map(item => parseFloat(item.bid)).reverse();
          valoresEUR = dadosEUR.map(item => parseFloat(item.bid)).reverse();
        }
      }
    } catch (e) {
      console.warn('Usando valores de reserva no gráfico:', e);
    }
  
    const ctx = canvasElement.getContext('2d');
  
    if (chartInstance) {
      chartInstance.destroy();
    }
  
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'USD / BRL',
            data: valoresUSD,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2.5,
            tension: 0.3,
            fill: true
          },
          {
            label: 'EUR / BRL',
            data: valoresEUR,
            borderColor: '#0f172a',
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
            borderWidth: 2.5,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  
  // INICIALIZAÇÃO AUTOMÁTICA
  document.addEventListener('DOMContentLoaded', () => {
    carregarCotacoesAPI();
    configurarSimulador();
    configurarAlertas();
  });