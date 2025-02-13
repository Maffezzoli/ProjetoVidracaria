import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONFIG_DOC_ID = 'site_config';

// Configurações padrão do site
export const defaultConfig = {
  titulo: 'Geovane Vidros',
  subtitulo: 'Qualidade e excelência em vidros e espelhos',
  logoUrl: '',
  faviconUrl: '',
  whatsapp: '', // Novo campo para WhatsApp
  servicos: [
    {
      titulo: 'Box para Banheiro',
      descricao: 'Instalação de box em vidro temperado para banheiros',
      icone: 'FaHome',
      cor: '#4299E1'
    },
    {
      titulo: 'Espelhos',
      descricao: 'Espelhos sob medida para sua casa ou estabelecimento',
      icone: 'FaGem',
      cor: '#48BB78'
    },
    {
      titulo: 'Vidros Temperados',
      descricao: 'Vidros temperados para portas, janelas e divisórias',
      icone: 'FaGlassWhiskey',
      cor: '#ED8936'
    }
  ],
  escolherNosTexto: 'Por que escolher a Geovane Vidros?',
  escolherNosFoto: '',
  diferenciais: [
    {
      titulo: 'Experiência',
      texto: 'Mais de 10 anos de experiência no mercado',
      icone: 'FaGlassWhiskey'
    },
    {
      titulo: 'Qualidade',
      texto: 'Utilizamos os melhores materiais e técnicas',
      icone: 'FaAward'
    },
    {
      titulo: 'Garantia',
      texto: 'Garantia em todos os nossos serviços',
      icone: 'FaShieldAlt'
    }
  ],
  nossosTrabalhos: []
};

// Busca as configurações do site
export async function getConfig() {
  try {
    const configRef = doc(db, 'configs', CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const data = configSnap.data();
      return {
        ...defaultConfig,
        ...data,
        servicos: data.servicos || defaultConfig.servicos,
        diferenciais: data.diferenciais || defaultConfig.diferenciais,
        nossosTrabalhos: data.nossosTrabalhos || []
      };
    }
    
    // Se não existir, cria com as configurações padrão
    await setDoc(configRef, defaultConfig);
    return defaultConfig;
  } catch (erro) {
    console.error('Erro ao buscar configurações:', erro);
    return defaultConfig;
  }
}

// Salva as configurações do site
export async function saveConfig(configs) {
  try {
    const configRef = doc(db, 'configs', CONFIG_DOC_ID);
    await setDoc(configRef, {
      ...configs,
      servicos: configs.servicos || defaultConfig.servicos,
      diferenciais: configs.diferenciais || defaultConfig.diferenciais,
      nossosTrabalhos: configs.nossosTrabalhos || [],
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (erro) {
    console.error('Erro ao salvar configurações:', erro);
    return false;
  }
}
