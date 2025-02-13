import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
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
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { Cliente, STATUS_PEDIDO } from '../models/Cliente';
import { Produto } from '../models/Produto';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '', endereco: '' });
  const [pedido, setPedido] = useState({
    descricao: '',
    status: STATUS_PEDIDO.ORCAMENTO,
    itens: [],
    valorTotal: 0,
    custoMaoDeObra: 0,
    valorFinal: 0
  });
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  
  const { isOpen: isClienteModalOpen, onOpen: onClienteModalOpen, onClose: onClienteModalClose } = useDisclosure();
  const { isOpen: isPedidoModalOpen, onOpen: onPedidoModalOpen, onClose: onPedidoModalClose } = useDisclosure();

  useEffect(() => {
    carregarClientes();
    carregarProdutos();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [clientes, busca, ordenacao, mesSelecionado, anoSelecionado]);

  async function carregarClientes() {
    try {
      const listaClientes = await Cliente.listar();
      setClientes(listaClientes);
    } catch (erro) {
      console.error('Erro ao carregar clientes:', erro);
    }
  }

  async function carregarProdutos() {
    try {
      const listaProdutos = await Produto.listar();
      setProdutos(listaProdutos);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
    }
  }

  function filtrarClientes() {
    let resultados = [...clientes];

    // Filtro por nome
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultados = resultados.filter(cliente =>
        cliente.nome.toLowerCase().includes(termoBusca) ||
        cliente.email.toLowerCase().includes(termoBusca) ||
        cliente.telefone.includes(termoBusca)
      );
    }

    // Filtro por mês e ano
    if (mesSelecionado || anoSelecionado) {
      resultados = resultados.filter(cliente => {
        if (!cliente.pedidos || cliente.pedidos.length === 0) return false;
        
        return cliente.pedidos.some(pedido => {
          if (!pedido.dataCriacao) return false;
          
          const dataPedido = new Date(pedido.dataCriacao.seconds * 1000);
          const mes = (dataPedido.getMonth() + 1).toString();
          const ano = dataPedido.getFullYear().toString();
          
          const mesMatch = !mesSelecionado || mes === mesSelecionado;
          const anoMatch = !anoSelecionado || ano === anoSelecionado;
          
          return mesMatch && anoMatch;
        });
      });
    }

    // Ordenação por data do pedido mais recente
    resultados.sort((a, b) => {
      const dataA = obterDataPedidoMaisRecente(a);
      const dataB = obterDataPedidoMaisRecente(b);

      if (ordenacao === 'recentes') {
        return dataB - dataA;
      } else {
        return dataA - dataB;
      }
    });

    setClientesFiltrados(resultados);
  }

  function obterDataPedidoMaisRecente(cliente) {
    if (!cliente.pedidos || cliente.pedidos.length === 0) {
      return 0;
    }

    return Math.max(...cliente.pedidos.map(pedido => 
      pedido.dataCriacao?.seconds || 0
    ));
  }

  async function handleAdicionarCliente() {
    try {
      await Cliente.criar(novoCliente);
      setNovoCliente({ nome: '', telefone: '', email: '', endereco: '' });
      onClienteModalClose();
      carregarClientes();
    } catch (erro) {
      console.error('Erro ao adicionar cliente:', erro);
    }
  }

  async function handleAdicionarPedido() {
    if (!clienteSelecionado) return;

    try {
      const cliente = new Cliente(clienteSelecionado);
      await cliente.adicionarPedido(pedido);
      setPedido({
        descricao: '',
        status: STATUS_PEDIDO.ORCAMENTO,
        itens: [],
        valorTotal: 0,
        custoMaoDeObra: 0,
        valorFinal: 0
      });
      onPedidoModalClose();
      carregarClientes();
    } catch (erro) {
      console.error('Erro ao adicionar pedido:', erro);
    }
  }

  function adicionarItem() {
    if (!produtoSelecionado || quantidade <= 0) return;

    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) return;

    const novoItem = {
      id: produto.id,
      nome: produto.nome,
      quantidade: quantidade,
      unidade: produto.unidade,
      precoCompra: produto.precoCompra,
      precoVenda: produto.precoVenda,
      custoTotal: produto.precoCompra * quantidade,
      valorVenda: produto.precoVenda * quantidade
    };

    const novosItens = [...pedido.itens, novoItem];
    const novoValorTotal = calcularValorTotal(novosItens);

    setPedido({
      ...pedido,
      itens: novosItens,
      valorTotal: novoValorTotal,
      valorFinal: novoValorTotal
    });

    setProdutoSelecionado('');
    setQuantidade(1);
  }

  function removerItem(index) {
    const novosItens = pedido.itens.filter((_, i) => i !== index);
    const novoValorTotal = calcularValorTotal(novosItens);

    setPedido({
      ...pedido,
      itens: novosItens,
      valorTotal: novoValorTotal,
      valorFinal: novoValorTotal
    });
  }

  function calcularValorTotal(itens, custoMaoDeObra = pedido.custoMaoDeObra) {
    const valorProdutos = itens.reduce((total, item) => total + (item.quantidade * item.precoVenda), 0);
    const custoTotal = valorProdutos + (custoMaoDeObra || 0);
    return custoTotal;
  }

  function handleMaoDeObraChange(valor) {
    const custoMaoDeObra = parseFloat(valor) || 0;
    const novoValorTotal = calcularValorTotal(pedido.itens, custoMaoDeObra);

    setPedido({
      ...pedido,
      custoMaoDeObra,
      valorTotal: novoValorTotal,
      valorFinal: novoValorTotal
    });
  }

  async function handleAtualizarStatus(cliente, pedidoId, novoStatus) {
    try {
      const clienteObj = new Cliente(cliente);
      await clienteObj.atualizarStatusPedido(pedidoId, novoStatus);
      carregarClientes();
    } catch (erro) {
      console.error('Erro ao atualizar status:', erro);
    }
  }

  function getStatusBadge(status) {
    const configs = {
      [STATUS_PEDIDO.ORCAMENTO]: { colorScheme: 'yellow', text: 'Orçamento' },
      [STATUS_PEDIDO.EM_ANDAMENTO]: { colorScheme: 'blue', text: 'Em Andamento' },
      [STATUS_PEDIDO.CONCLUIDO]: { colorScheme: 'green', text: 'Concluído' }
    };
    const config = configs[status] || { colorScheme: 'gray', text: status };
    return <Badge colorScheme={config.colorScheme}>{config.text}</Badge>;
  }

  function formatarData(data) {
    if (!data || !data.seconds) return '';
    const d = new Date(data.seconds * 1000);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
  }

  function formatarMoeda(valor) {
    if (typeof valor !== 'number') return 'R$ 0,00';
    return `R$ ${valor.toFixed(2)}`;
  }

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <HStack mb={4} justify="space-between">
          <Text fontSize="2xl">Gerenciamento de Clientes</Text>
          <Button colorScheme="blue" onClick={onClienteModalOpen}>
            Novo Cliente
          </Button>
        </HStack>

        <VStack spacing={4}>
          <HStack spacing={4} width="100%">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </InputGroup>

            <Select
              width="200px"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="recentes">Mais Recentes</option>
              <option value="antigos">Mais Antigos</option>
            </Select>
          </HStack>

          <HStack spacing={4} width="100%">
            <Select
              placeholder="Selecione o mês"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              width="200px"
            >
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </Select>

            <Select
              placeholder="Selecione o ano"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              width="200px"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const ano = new Date().getFullYear() - i;
                return (
                  <option key={ano} value={ano.toString()}>
                    {ano}
                  </option>
                );
              })}
            </Select>

            <Button
              colorScheme="gray"
              onClick={() => {
                setMesSelecionado('');
                setAnoSelecionado('');
              }}
            >
              Limpar Filtros
            </Button>
          </HStack>
        </VStack>

        <Tabs>
          <TabList>
            <Tab>Todos ({clientesFiltrados.length})</Tab>
            <Tab>Orçamentos ({clientesFiltrados.filter(c => c.pedidos?.some(p => p.status === STATUS_PEDIDO.ORCAMENTO)).length})</Tab>
            <Tab>Em Andamento ({clientesFiltrados.filter(c => c.pedidos?.some(p => p.status === STATUS_PEDIDO.EM_ANDAMENTO)).length})</Tab>
            <Tab>Concluídos ({clientesFiltrados.filter(c => c.pedidos?.some(p => p.status === STATUS_PEDIDO.CONCLUIDO)).length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <ClientesList
                clientes={clientesFiltrados}
                onAddPedido={(cliente) => {
                  setClienteSelecionado(cliente);
                  onPedidoModalOpen();
                }}
                onUpdateStatus={handleAtualizarStatus}
                getStatusBadge={getStatusBadge}
                formatarData={formatarData}
                formatarMoeda={formatarMoeda}
              />
            </TabPanel>
            <TabPanel>
              <ClientesList
                clientes={clientesFiltrados.filter(c => c.pedidos?.some(p => p.status === STATUS_PEDIDO.ORCAMENTO))}
                onAddPedido={(cliente) => {
                  setClienteSelecionado(cliente);
                  onPedidoModalOpen();
                }}
                onUpdateStatus={handleAtualizarStatus}
                getStatusBadge={getStatusBadge}
                formatarData={formatarData}
                formatarMoeda={formatarMoeda}
              />
            </TabPanel>
            <TabPanel>
              <ClientesList
                clientes={clientesFiltrados.filter(c => c.pedidos?.some(p => p.status === STATUS_PEDIDO.EM_ANDAMENTO))}
                onAddPedido={(cliente) => {
                  setClienteSelecionado(cliente);
                  onPedidoModalOpen();
                }}
                onUpdateStatus={handleAtualizarStatus}
                getStatusBadge={getStatusBadge}
                formatarData={formatarData}
                formatarMoeda={formatarMoeda}
              />
            </TabPanel>
            <TabPanel>
              <ClientesList
                clientes={clientesFiltrados.filter(c => c.pedidos?.some(p => p.status === STATUS_PEDIDO.CONCLUIDO))}
                onAddPedido={(cliente) => {
                  setClienteSelecionado(cliente);
                  onPedidoModalOpen();
                }}
                onUpdateStatus={handleAtualizarStatus}
                getStatusBadge={getStatusBadge}
                formatarData={formatarData}
                formatarMoeda={formatarMoeda}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modal de Novo Cliente */}
        <Modal isOpen={isClienteModalOpen} onClose={onClienteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Novo Cliente</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Endereço</FormLabel>
                  <Textarea
                    value={novoCliente.endereco}
                    onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                  />
                </FormControl>
                <Button colorScheme="blue" onClick={handleAdicionarCliente} width="100%">
                  Adicionar Cliente
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de Novo Pedido */}
        <Modal isOpen={isPedidoModalOpen} onClose={onPedidoModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Novo Pedido para {clienteSelecionado?.nome}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Descrição</FormLabel>
                  <Input
                    value={pedido.descricao}
                    onChange={(e) => setPedido({ ...pedido, descricao: e.target.value })}
                    placeholder="Descreva o pedido"
                  />
                </FormControl>

                <Box width="100%" borderWidth={1} p={4} borderRadius="md">
                  <Text mb={2} fontWeight="bold">Adicionar Produtos</Text>
                  <HStack spacing={4} mb={4}>
                    <FormControl>
                      <FormLabel>Produto</FormLabel>
                      <Select
                        value={produtoSelecionado}
                        onChange={(e) => setProdutoSelecionado(e.target.value)}
                        placeholder="Selecione um produto"
                      >
                        {produtos.map(produto => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} - {produto.unidade} - {formatarMoeda(produto.precoVenda)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Quantidade</FormLabel>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={quantidade}
                        onChange={(e) => setQuantidade(parseFloat(e.target.value))}
                      />
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      onClick={adicionarItem}
                      alignSelf="flex-end"
                    >
                      Adicionar
                    </Button>
                  </HStack>

                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Produto</Th>
                        <Th>Quantidade</Th>
                        <Th>Preço Unit.</Th>
                        <Th>Total</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pedido.itens.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.nome}</Td>
                          <Td>{item.quantidade} {item.unidade}</Td>
                          <Td>{formatarMoeda(item.precoVenda)}</Td>
                          <Td>{formatarMoeda(item.valorVenda)}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => removerItem(index)}
                            >
                              Remover
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <VStack mt={4} align="stretch">
                    <FormControl>
                      <FormLabel>Custo de Mão de Obra</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={pedido.custoMaoDeObra}
                        onChange={(e) => handleMaoDeObraChange(e.target.value)}
                      />
                    </FormControl>

                    <HStack justify="space-between" mt={2}>
                      <Text>Subtotal Produtos:</Text>
                      <Text>{formatarMoeda(pedido.valorTotal - pedido.custoMaoDeObra)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Mão de Obra:</Text>
                      <Text>{formatarMoeda(pedido.custoMaoDeObra)}</Text>
                    </HStack>
                    <HStack justify="space-between" fontWeight="bold">
                      <Text>Valor Final:</Text>
                      <Text>{formatarMoeda(pedido.valorFinal)}</Text>
                    </HStack>
                  </VStack>
                </Box>

                <Button colorScheme="blue" width="100%" onClick={handleAdicionarPedido}>
                  Salvar Pedido
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}

function ClientesList({ clientes, onAddPedido, onUpdateStatus, getStatusBadge, formatarData, formatarMoeda }) {
  return (
    <Accordion allowMultiple>
      {clientes.map(cliente => (
        <AccordionItem key={cliente.id}>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="bold">{cliente.nome}</Text>
              <Text fontSize="sm" color="gray.600">
                {cliente.telefone} - {cliente.email}
              </Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text>Endereço: {cliente.endereco}</Text>
                <Button size="sm" colorScheme="blue" onClick={() => onAddPedido(cliente)}>
                  Novo Pedido
                </Button>
              </HStack>

              {cliente.pedidos?.map(pedido => (
                <Box
                  key={pedido.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between" mb={2}>
                    <Box>
                      <HStack mb={2}>
                        {getStatusBadge(pedido.status)}
                        <Text fontSize="sm" color="gray.600">
                          Criado em: {formatarData(pedido.dataCriacao)}
                        </Text>
                      </HStack>
                      <Text>{pedido.descricao}</Text>
                    </Box>
                    <VStack>
                      {pedido.status === STATUS_PEDIDO.ORCAMENTO && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => onUpdateStatus(cliente, pedido.id, STATUS_PEDIDO.EM_ANDAMENTO)}
                        >
                          Iniciar
                        </Button>
                      )}
                      {pedido.status === STATUS_PEDIDO.EM_ANDAMENTO && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => onUpdateStatus(cliente, pedido.id, STATUS_PEDIDO.CONCLUIDO)}
                        >
                          Concluir
                        </Button>
                      )}
                    </VStack>
                  </HStack>

                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Produto</Th>
                        <Th>Quantidade</Th>
                        <Th>Preço Unit.</Th>
                        <Th>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pedido.itens?.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.nome}</Td>
                          <Td>{item.quantidade} {item.unidade}</Td>
                          <Td>{formatarMoeda(item.precoVenda)}</Td>
                          <Td>{formatarMoeda(item.valorVenda)}</Td>
                        </Tr>
                      ))}
                      <Tr fontWeight="bold">
                        <Td colSpan={3}>Total do Pedido:</Td>
                        <Td>{formatarMoeda(pedido.valorTotal)}</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  <Box mt={2}>
                    <Text fontSize="sm" fontWeight="bold">Histórico:</Text>
                    {pedido.historico?.map((evento, index) => (
                      <Text key={index} fontSize="sm" color="gray.600">
                        {formatarData(evento.data)} - {evento.status}
                        {evento.observacao && ` - ${evento.observacao}`}
                      </Text>
                    ))}
                  </Box>
                </Box>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
