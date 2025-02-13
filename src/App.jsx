import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, VStack, Link, Icon, Text, HStack, ChakraProvider, Button, Spacer } from '@chakra-ui/react';
import { FaCog, FaUsers, FaHome, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ClientesPage from './pages/ClientesPage';
import ProdutosPage from './pages/ProdutosPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider, RequireAuth, useAuth } from './contexts/AuthContext';

function AdminMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/clientes' || location.pathname === '/produtos' || location.pathname === '/dashboard';

  if (!user || !isAdminRoute) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Box
      w="250px"
      h="100vh"
      bg="blue.700"
      color="white"
      py={8}
      px={4}
      position="fixed"
      left={0}
      top={0}
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={4} align="stretch" flex={1}>
        <Link as={RouterLink} to="/admin" _hover={{ bg: 'blue.600' }} p={2} borderRadius="md">
          <HStack>
            <Icon as={FaHome} />
            <Text>Início</Text>
          </HStack>
        </Link>
        <Link as={RouterLink} to="/dashboard" _hover={{ bg: 'blue.600' }} p={2} borderRadius="md">
          <HStack>
            <Icon as={FaChartBar} />
            <Text>Dashboard</Text>
          </HStack>
        </Link>
        <Link as={RouterLink} to="/clientes" _hover={{ bg: 'blue.600' }} p={2} borderRadius="md">
          <HStack>
            <Icon as={FaUsers} />
            <Text>Clientes</Text>
          </HStack>
        </Link>
        <Link as={RouterLink} to="/produtos" _hover={{ bg: 'blue.600' }} p={2} borderRadius="md">
          <HStack>
            <Icon as={FaUsers} />
            <Text>Produtos</Text>
          </HStack>
        </Link>
        <Link as={RouterLink} to="/" _hover={{ bg: 'blue.600' }} p={2} borderRadius="md">
          <HStack>
            <Icon as={FaHome} />
            <Text>Voltar ao Site</Text>
          </HStack>
        </Link>
        <Spacer />
        <Button
          leftIcon={<FaSignOutAlt />}
          variant="ghost"
          color="white"
          _hover={{ bg: 'blue.600' }}
          onClick={handleLogout}
          w="100%"
          justifyContent="flex-start"
        >
          Sair
        </Button>
      </VStack>
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <BrowserRouter>
          <Box minH="100vh">
            <AdminMenu />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Box ml="250px" w="calc(100% - 250px)" minH="100vh">
                      <Dashboard />
                    </Box>
                  </RequireAuth>
                }
              />
              <Route
                path="/clientes"
                element={
                  <RequireAuth>
                    <Box ml="250px" w="calc(100% - 250px)" minH="100vh">
                      <ClientesPage />
                    </Box>
                  </RequireAuth>
                }
              />
              <Route
                path="/produtos"
                element={
                  <RequireAuth>
                    <Box ml="250px" w="calc(100% - 250px)" minH="100vh">
                      <ProdutosPage />
                    </Box>
                  </RequireAuth>
                }
              />
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
