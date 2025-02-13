import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

const COLECAO_PRODUTOS = 'produtos';

export class Produto {
  constructor(id, dados) {
    this.id = id;
    this.nome = dados.nome;
    this.descricao = dados.descricao || '';
    this.precoCompra = dados.precoCompra || 0;
    this.precoVenda = dados.precoVenda || 0;
    this.unidade = dados.unidade || 'metro';
    this.categoria = dados.categoria || '';
    this.margemLucro = this.calcularMargemLucro();
  }

  calcularMargemLucro() {
    if (!this.precoCompra || this.precoCompra === 0) return 0;
    return ((this.precoVenda - this.precoCompra) / this.precoCompra) * 100;
  }

  static async listar() {
    try {
      const produtosRef = collection(db, COLECAO_PRODUTOS);
      const q = query(produtosRef, orderBy('nome'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => new Produto(doc.id, doc.data()));
    } catch (erro) {
      console.error('Erro ao listar produtos:', erro);
      throw erro;
    }
  }

  static async criar(dados) {
    try {
      const docRef = await addDoc(collection(db, COLECAO_PRODUTOS), {
        ...dados,
        margemLucro: ((dados.precoVenda - dados.precoCompra) / dados.precoCompra) * 100
      });
      return new Produto(docRef.id, dados);
    } catch (erro) {
      console.error('Erro ao criar produto:', erro);
      throw erro;
    }
  }

  async atualizar(dados) {
    try {
      const dadosAtualizados = {
        ...dados,
        margemLucro: ((dados.precoVenda - dados.precoCompra) / dados.precoCompra) * 100
      };
      const docRef = doc(db, COLECAO_PRODUTOS, this.id);
      await updateDoc(docRef, dadosAtualizados);
      Object.assign(this, dados);
      this.margemLucro = this.calcularMargemLucro();
    } catch (erro) {
      console.error('Erro ao atualizar produto:', erro);
      throw erro;
    }
  }

  async excluir() {
    try {
      const docRef = doc(db, COLECAO_PRODUTOS, this.id);
      await deleteDoc(docRef);
    } catch (erro) {
      console.error('Erro ao excluir produto:', erro);
      throw erro;
    }
  }
}
