import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Produto } from '../models/Produto';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState(null);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    descricao: '',
    precoCompra: '',
    precoVenda: '',
    unidade: 'metro',
    categoria: ''
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const lista = await Produto.listar();
      setProdutos(lista);
    } catch (erro) {
      toast({
        title: 'Erro ao carregar produtos',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  }

  function handleNovoProduto() {
    setProdutoAtual(null);
    setNovoProduto({
      nome: '',
      descricao: '',
      precoCompra: '',
      precoVenda: '',
      unidade: 'metro',
      categoria: ''
    });
    onOpen();
  }

  function handleEditarProduto(produto) {
    setProdutoAtual(produto);
    setNovoProduto({
      nome: produto.nome,
      descricao: produto.descricao,
      precoCompra: produto.precoCompra.toString(),
      precoVenda: produto.precoVenda.toString(),
      unidade: produto.unidade,
      categoria: produto.categoria
    });
    onOpen();
  }

  async function handleSalvarProduto() {
    try {
      const dados = {
        ...novoProduto,
        precoCompra: parseFloat(novoProduto.precoCompra),
        precoVenda: parseFloat(novoProduto.precoVenda)
      };

      if (produtoAtual) {
        await produtoAtual.atualizar(dados);
      } else {
        await Produto.criar(dados);
      }

      onClose();
      carregarProdutos();
      toast({
        title: 'Sucesso',
        description: produtoAtual ? 'Produto atualizado!' : 'Produto criado!',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (erro) {
      toast({
        title: 'Erro ao salvar produto',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  }

  async function handleExcluirProduto(produto) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await produto.excluir();
      carregarProdutos();
      toast({
        title: 'Sucesso',
        description: 'Produto excluído!',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (erro) {
      toast({
        title: 'Erro ao excluir produto',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  }

  function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2)}`;
  }

  return (
    <Box p={4}>
      <HStack mb={4} justify="space-between">
        <Text fontSize="2xl">Gerenciamento de Produtos</Text>
        <Button colorScheme="blue" onClick={handleNovoProduto}>
          Novo Produto
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Descrição</Th>
            <Th>Categoria</Th>
            <Th>Preço Compra</Th>
            <Th>Preço Venda</Th>
            <Th>Margem</Th>
            <Th>Unidade</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {produtos.map(produto => (
            <Tr key={produto.id}>
              <Td>{produto.nome}</Td>
              <Td>{produto.descricao}</Td>
              <Td>{produto.categoria}</Td>
              <Td>{formatarMoeda(produto.precoCompra)}</Td>
              <Td>{formatarMoeda(produto.precoVenda)}</Td>
              <Td>{produto.margemLucro.toFixed(1)}%</Td>
              <Td>{produto.unidade}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<FaEdit />}
                    aria-label="Editar produto"
                    size="sm"
                    onClick={() => handleEditarProduto(produto)}
                  />
                  <IconButton
                    icon={<FaTrash />}
                    aria-label="Excluir produto"
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleExcluirProduto(produto)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {produtoAtual ? 'Editar Produto' : 'Novo Produto'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={novoProduto.nome}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, nome: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Input
                  value={novoProduto.descricao}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, descricao: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Categoria</FormLabel>
                <Input
                  value={novoProduto.categoria}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, categoria: e.target.value })
                  }
                  placeholder="Ex: Vidro, Espelho, Box..."
                />
              </FormControl>

              <HStack width="100%" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Preço de Compra</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoProduto.precoCompra}
                    onChange={(e) =>
                      setNovoProduto({ ...novoProduto, precoCompra: parseFloat(e.target.value) })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Preço de Venda</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoProduto.precoVenda}
                    onChange={(e) =>
                      setNovoProduto({ ...novoProduto, precoVenda: parseFloat(e.target.value) })
                    }
                  />
                </FormControl>
              </HStack>

              {novoProduto.precoCompra > 0 && novoProduto.precoVenda > 0 && (
                <Text color="gray.600">
                  Margem de Lucro: {((novoProduto.precoVenda - novoProduto.precoCompra) / novoProduto.precoCompra * 100).toFixed(1)}%
                </Text>
              )}

              <FormControl>
                <FormLabel>Unidade</FormLabel>
                <Select
                  value={novoProduto.unidade}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, unidade: e.target.value })
                  }
                >
                  <option value="metro">Metro</option>
                  <option value="m²">Metro Quadrado</option>
                  <option value="unidade">Unidade</option>
                  <option value="conjunto">Conjunto</option>
                </Select>
              </FormControl>

              <Button
                colorScheme="blue"
                width="100%"
                onClick={handleSalvarProduto}
              >
                {produtoAtual ? 'Atualizar' : 'Criar'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
