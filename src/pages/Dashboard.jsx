import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Container,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Spinner,
  Center,
  HStack,
  Select,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import {
  Line, Bar, Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    produto: 'todos',
  });
  const [dashboardData, setDashboardData] = useState({
    totalVendas: 0,
    lucroBruto: 0,
    lucroLiquido: 0,
    tempoMedioConclusao: 0,
    vendasPorMes: {},
    produtosMaisVendidos: [],
    lucrosPorCategoria: {},
  });

  // Carregar lista de produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const produtosRef = collection(db, 'produtos');
        const produtosSnapshot = await getDocs(query(produtosRef));
        const produtosList = produtosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProdutos(produtosList);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    };
    fetchProdutos();
  }, []);

  // Função para verificar se um pedido está dentro do período filtrado
  const estaDentroDoPeriodo = (dataPedido) => {
    if (!filtros.dataInicio && !filtros.dataFim) return true;
    
    const data = dataPedido.toDate();
    const inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
    const fim = filtros.dataFim ? new Date(filtros.dataFim) : null;
    
    if (inicio && fim) {
      return data >= inicio && data <= fim;
    } else if (inicio) {
      return data >= inicio;
    } else if (fim) {
      return data <= fim;
    }
    return true;
  };

  // Função para verificar se um pedido contém o produto filtrado
  const contemProdutoFiltrado = (produtos) => {
    if (filtros.produto === 'todos') return true;
    return produtos?.some(p => p.id === filtros.produto);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const pedidosRef = collection(db, 'pedidos');
        const pedidosSnapshot = await getDocs(query(pedidosRef));
        
        let totalVendas = 0;
        let lucroBruto = 0;
        let lucroLiquido = 0;
        let tempoTotalConclusao = 0;
        let quantidadePedidos = 0;
        let vendasPorMes = {};
        let produtoCount = {};
        let lucrosPorCategoria = {};

        pedidosSnapshot.forEach((doc) => {
          const pedido = doc.data();
          
          // Aplicar filtros
          if (!estaDentroDoPeriodo(pedido.dataPedido) || !contemProdutoFiltrado(pedido.produtos)) {
            return;
          }

          // Calcular totais
          totalVendas += pedido.valorTotal || 0;
          lucroBruto += pedido.valorLucro || 0;
          lucroLiquido += (pedido.valorLucro + pedido.valorMaoDeObra) || 0;
          
          // Calcular tempo médio
          if (pedido.dataConclusao && pedido.dataPedido) {
            const tempoConclusao = pedido.dataConclusao.toDate() - pedido.dataPedido.toDate();
            tempoTotalConclusao += tempoConclusao;
            quantidadePedidos++;
          }

          // Vendas por mês
          const mes = pedido.dataPedido ? pedido.dataPedido.toDate().toLocaleString('pt-BR', { month: 'long' }) : 'Desconhecido';
          vendasPorMes[mes] = (vendasPorMes[mes] || 0) + pedido.valorTotal;

          // Produtos mais vendidos
          pedido.produtos?.forEach(produto => {
            produtoCount[produto.nome] = (produtoCount[produto.nome] || 0) + 1;
          });

          // Lucros por categoria
          if (pedido.categoria) {
            lucrosPorCategoria[pedido.categoria] = (lucrosPorCategoria[pedido.categoria] || 0) + (pedido.valorLucro + pedido.valorMaoDeObra);
          }
        });

        setDashboardData({
          totalVendas,
          lucroBruto,
          lucroLiquido,
          tempoMedioConclusao: quantidadePedidos ? tempoTotalConclusao / quantidadePedidos / (1000 * 60 * 60 * 24) : 0,
          vendasPorMes,
          produtosMaisVendidos: Object.entries(produtoCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5),
          lucrosPorCategoria,
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filtros]); // Recarregar quando os filtros mudarem

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Configuração dos gráficos
  const vendasMensaisConfig = {
    labels: Object.keys(dashboardData.vendasPorMes),
    datasets: [
      {
        label: 'Vendas por Mês',
        data: Object.values(dashboardData.vendasPorMes),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const produtosMaisVendidosConfig = {
    labels: dashboardData.produtosMaisVendidos.map(([nome]) => nome),
    datasets: [
      {
        label: 'Produtos Mais Vendidos',
        data: dashboardData.produtosMaisVendidos.map(([, quantidade]) => quantidade),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const lucrosPorCategoriaConfig = {
    labels: Object.keys(dashboardData.lucrosPorCategoria),
    datasets: [
      {
        label: 'Lucro por Categoria',
        data: Object.values(dashboardData.lucrosPorCategoria),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Heading mb={6}>Dashboard</Heading>
      
      {/* Filtros */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2}>Filtros</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Data Início</FormLabel>
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Data Fim</FormLabel>
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Produto</FormLabel>
                <Select
                  value={filtros.produto}
                  onChange={(e) => setFiltros(prev => ({ ...prev, produto: e.target.value }))}
                >
                  <option value="todos">Todos os Produtos</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            <Button
              colorScheme="blue"
              onClick={() => setFiltros({ dataInicio: '', dataFim: '', produto: 'todos' })}
            >
              Limpar Filtros
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Cards de Estatísticas */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Stat>
          <Card>
            <CardBody>
              <StatLabel>Total de Vendas</StatLabel>
              <StatNumber>R$ {dashboardData.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</StatNumber>
              <StatHelpText>Valor total das vendas</StatHelpText>
            </CardBody>
          </Card>
        </Stat>

        <Stat>
          <Card>
            <CardBody>
              <StatLabel>Lucro Bruto</StatLabel>
              <StatNumber>R$ {dashboardData.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</StatNumber>
              <StatHelpText>Sem considerar mão de obra</StatHelpText>
            </CardBody>
          </Card>
        </Stat>

        <Stat>
          <Card>
            <CardBody>
              <StatLabel>Lucro Líquido</StatLabel>
              <StatNumber>R$ {dashboardData.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</StatNumber>
              <StatHelpText>Incluindo mão de obra</StatHelpText>
            </CardBody>
          </Card>
        </Stat>

        <Stat>
          <Card>
            <CardBody>
              <StatLabel>Tempo Médio de Conclusão</StatLabel>
              <StatNumber>{dashboardData.tempoMedioConclusao.toFixed(1)} dias</StatNumber>
              <StatHelpText>Média por pedido</StatHelpText>
            </CardBody>
          </Card>
        </Stat>
      </SimpleGrid>

      {/* Gráficos */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Vendas Mensais</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Line data={vendasMensaisConfig} options={{ maintainAspectRatio: false }} />
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Produtos Mais Vendidos</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Bar data={produtosMaisVendidosConfig} options={{ maintainAspectRatio: false }} />
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Lucro por Categoria</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Doughnut data={lucrosPorCategoriaConfig} options={{ maintainAspectRatio: false }} />
            </Box>
          </CardBody>
        </Card>
      </Grid>
    </Container>
  );
};

export default Dashboard;
