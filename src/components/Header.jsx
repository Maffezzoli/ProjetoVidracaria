import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Container,
  Image,
  IconButton,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getConfig } from '../models/Config';

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const [logo, setLogo] = useState('/logo-placeholder.png');

  useEffect(() => {
    const carregarConfig = async () => {
      try {
        const config = await getConfig();
        if (config.logoUrl) {
          setLogo(config.logoUrl);
        }
      } catch (erro) {
        console.error('Erro ao carregar logo:', erro);
      }
    };
    carregarConfig();
  }, []);

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} position="fixed" w="100%" zIndex={999} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <ChakraLink as={RouterLink} to="/">
            <Image
              h="40px"
              src={logo}
              alt="Logo Vidraçaria"
              fallbackSrc="/logo-placeholder.png"
            />
          </ChakraLink>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <IconButton
                onClick={toggleColorMode}
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                aria-label="Alternar tema"
                variant="ghost"
              />
              
              {user ? (
                <>
                  <Button
                    as={RouterLink}
                    to="/admin"
                    colorScheme="blue"
                    variant="ghost"
                  >
                    Painel Admin
                  </Button>
                  <Button
                    onClick={logout}
                    colorScheme="red"
                    variant="ghost"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  as={RouterLink}
                  to="/login"
                  colorScheme="blue"
                  variant="ghost"
                >
                  Login
                </Button>
              )}
            </Stack>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
