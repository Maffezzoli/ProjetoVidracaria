import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Icon,
  VStack,
  useColorModeValue,
  Spinner,
  Center
} from '@chakra-ui/react';
import { getAllServices } from '../models/Service';
import { 
  FaGlasses, 
  FaWindowMaximize, 
  FaDoorOpen, 
  FaHome, 
  FaTools, 
  FaWrench, 
  FaHammer, 
  FaRuler, 
  FaShieldAlt, 
  FaGem 
} from 'react-icons/fa';

const iconMap = {
  FaGlasses,
  FaWindowMaximize,
  FaDoorOpen,
  FaHome,
  FaTools,
  FaWrench,
  FaHammer,
  FaRuler,
  FaShieldAlt,
  FaGem
};

export default function ServicesSection() {
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      const servicosCarregados = await getAllServices();
      setServicos(servicosCarregados);
      setErro(null);
    } catch (erro) {
      console.error('Erro ao carregar serviços:', erro);
      setErro('Não foi possível carregar os serviços');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (erro) {
    return (
      <Center py={20}>
        <Text color="red.500">{erro}</Text>
      </Center>
    );
  }

  return (
    <Box bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading
            fontSize={{ base: '3xl', md: '4xl' }}
            textAlign="center"
          >
            Nossos Serviços
          </Heading>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={10}
            width="100%"
          >
            {servicos.map((servico) => {
              const IconComponent = iconMap[servico.icone];
              
              return (
                <Box
                  key={servico.id}
                  bg={cardBgColor}
                  p={6}
                  rounded="lg"
                  shadow="lg"
                  transition="all 0.3s"
                  _hover={{ transform: 'translateY(-5px)' }}
                >
                  <VStack spacing={4} align="center">
                    {IconComponent && (
                      <Icon
                        as={IconComponent}
                        w={10}
                        h={10}
                        color="blue.500"
                      />
                    )}
                    <Heading size="md" textAlign="center">
                      {servico.nome}
                    </Heading>
                    <Text textAlign="center">
                      {servico.descricao}
                    </Text>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
