import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

const COLECAO_CLIENTES = 'clientes';

export const STATUS_PEDIDO = {
  ORCAMENTO: 'orcamento',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido'
};

export class Cliente {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome || '';
    this.telefone = data.telefone || '';
    this.email = data.email || '';
    this.endereco = data.endereco || '';
    this.pedidos = data.pedidos || [];
    this.dataCadastro = data.dataCadastro ? new Date(data.dataCadastro.seconds * 1000) : new Date();
  }

  static async criar(dados) {
    try {
      const clienteRef = await addDoc(collection(db, COLECAO_CLIENTES), {
        ...dados,
        dataCadastro: new Date()
      });
      return new Cliente({ id: clienteRef.id, ...dados });
    } catch (erro) {
      console.error('Erro ao criar cliente:', erro);
      throw erro;
    }
  }

  static async listar() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLECAO_CLIENTES), orderBy('dataCadastro', 'desc'))
      );
      return querySnapshot.docs.map(doc => new Cliente({ id: doc.id, ...doc.data() }));
    } catch (erro) {
      console.error('Erro ao listar clientes:', erro);
      throw erro;
    }
  }

  static async listarPorStatus(status) {
    try {
      const q = query(
        collection(db, COLECAO_CLIENTES),
        where('pedidos', 'array-contains', { status }),
        orderBy('dataCadastro', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => new Cliente({ id: doc.id, ...doc.data() }));
    } catch (erro) {
      console.error('Erro ao listar clientes por status:', erro);
      throw erro;
    }
  }

  async atualizar(dados) {
    try {
      const docRef = doc(db, COLECAO_CLIENTES, this.id);
      await updateDoc(docRef, dados);
      Object.assign(this, dados);
    } catch (erro) {
      console.error('Erro ao atualizar cliente:', erro);
      throw erro;
    }
  }

  async adicionarPedido(pedido) {
    try {
      const docRef = doc(db, COLECAO_CLIENTES, this.id);
      const novoPedido = {
        ...pedido,
        id: Date.now().toString(),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        status: STATUS_PEDIDO.ORCAMENTO,
        itens: pedido.itens || [],
        valorTotal: pedido.itens?.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0) || 0,
        historico: [{
          data: new Date(),
          status: STATUS_PEDIDO.ORCAMENTO,
          observacao: 'Pedido criado'
        }]
      };
      
      this.pedidos = [...(this.pedidos || []), novoPedido];
      await updateDoc(docRef, { pedidos: this.pedidos });
      return novoPedido;
    } catch (erro) {
      console.error('Erro ao adicionar pedido:', erro);
      throw erro;
    }
  }

  async atualizarStatusPedido(pedidoId, novoStatus, observacao = '') {
    try {
      const docRef = doc(db, COLECAO_CLIENTES, this.id);
      const pedidoIndex = this.pedidos.findIndex(p => p.id === pedidoId);
      
      if (pedidoIndex === -1) {
        throw new Error('Pedido não encontrado');
      }

      const dataAtualizacao = new Date();
      
      this.pedidos[pedidoIndex] = {
        ...this.pedidos[pedidoIndex],
        status: novoStatus,
        dataAtualizacao,
        historico: [
          ...(this.pedidos[pedidoIndex].historico || []),
          {
            data: dataAtualizacao,
            status: novoStatus,
            observacao
          }
        ]
      };

      await updateDoc(docRef, { pedidos: this.pedidos });
    } catch (erro) {
      console.error('Erro ao atualizar status do pedido:', erro);
      throw erro;
    }
  }

  async excluir() {
    try {
      await deleteDoc(doc(db, COLECAO_CLIENTES, this.id));
    } catch (erro) {
      console.error('Erro ao excluir cliente:', erro);
      throw erro;
    }
  }

  // Métodos para análise e dashboard
  static async getPedidosPorMes(mes, ano) {
    try {
      const clientes = await this.listar();
      const pedidos = clientes.flatMap(cliente => 
        cliente.pedidos.filter(pedido => {
          const dataPedido = new Date(pedido.dataCriacao.seconds * 1000);
          return dataPedido.getMonth() === mes && dataPedido.getFullYear() === ano;
        })
      );

      return {
        total: pedidos.length,
        valorTotal: pedidos.reduce((total, pedido) => total + pedido.valorTotal, 0),
        porStatus: {
          [STATUS_PEDIDO.ORCAMENTO]: pedidos.filter(p => p.status === STATUS_PEDIDO.ORCAMENTO).length,
          [STATUS_PEDIDO.EM_ANDAMENTO]: pedidos.filter(p => p.status === STATUS_PEDIDO.EM_ANDAMENTO).length,
          [STATUS_PEDIDO.CONCLUIDO]: pedidos.filter(p => p.status === STATUS_PEDIDO.CONCLUIDO).length
        }
      };
    } catch (erro) {
      console.error('Erro ao buscar pedidos por mês:', erro);
      throw erro;
    }
  }
}
