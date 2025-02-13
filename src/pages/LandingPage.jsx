import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Link,
  useColorModeValue,
  Image,
  Flex,
  Grid,
  GridItem,
  Icon,
  VStack,
  HStack,
  Divider,
  SimpleGrid
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import {
  FaWhatsapp,
  FaGlassWhiskey,
  FaHome,
  FaBuilding,
  FaIndustry,
  FaAward,
  FaShieldAlt,
  FaClock,
  FaTools,
  FaHandshake,
  FaGem,
  FaWrench,
  FaHammer,
  FaRuler
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import ImageSlider from '../components/ImageSlider';
import { getConfig } from '../models/Config';

const MotionBox = motion.create(Box);

const iconMap = {
  FaGlassWhiskey,
  FaHome,
  FaBuilding,
  FaIndustry,
  FaAward,
  FaShieldAlt,
  FaClock,
  FaTools,
  FaHandshake,
  FaGem,
  FaWrench,
  FaHammer,
  FaRuler
};

const servicos = [
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
];

export default function LandingPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');

  const [configs, setConfigs] = useState({
    titulo: '',
    subtitulo: '',
    logoUrl: '',
    escolherNosTexto: '',
    escolherNosFoto: '',
    diferenciais: [],
    nossosTrabalhos: [],
    servicos: servicos // Usando os serviços padrão inicialmente
  });

  useEffect(() => {
    const carregarConfigs = async () => {
      try {
        const configsCarregadas = await getConfig();
        console.log('Configurações carregadas:', configsCarregadas);
        setConfigs(prev => ({
          ...configsCarregadas,
          servicos: configsCarregadas.servicos?.length > 0 
            ? configsCarregadas.servicos 
            : servicos
        }));
      } catch (erro) {
        console.error('Erro ao carregar configurações:', erro);
      }
    };
    carregarConfigs();
  }, []);

  return (
    <Box>
      {/* Banner Principal */}
      <Box
        w="100%"
        h={{ base: "60vh", md: "80vh" }}
        position="relative"
        overflow="hidden"
      >
        <ImageSlider trabalhos={configs.nossosTrabalhos || []} />
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          px={4}
        >
          <VStack spacing={4} maxW="container.lg">
            <Heading
              as="h1"
              size="2xl"
              color="white"
              fontWeight="bold"
            >
              {configs.titulo || 'Geovane Vidros'}
            </Heading>
            <Text
              fontSize="xl"
              color="white"
              maxW="800px"
            >
              {configs.subtitulo || 'Qualidade e excelência em vidros e espelhos'}
            </Text>
            <Button
              as={Link}
              href={`https://wa.me/55${configs.whatsapp}`}
              target="_blank"
              colorScheme="whatsapp"
              size="lg"
              leftIcon={<FaWhatsapp />}
              _hover={{
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }}
            >
              Solicitar Orçamento
            </Button>
          </VStack>
        </Box>
      </Box>

      {/* Seção de Serviços */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center">
              <Heading
                as="h2"
                size="xl"
                mb={4}
                color={headingColor}
              >
                Nossos Serviços
              </Heading>
              <Text
                fontSize="lg"
                color={textColor}
                maxW="600px"
                mx="auto"
              >
                Oferecemos soluções completas em vidros e espelhos para todos os tipos de projetos
              </Text>
            </Box>

            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              width="100%"
            >
              {configs.servicos.map((servico, index) => {
                console.log('Renderizando serviço:', servico);
                const IconComponent = iconMap[servico.icone] || FaGlassWhiskey;
                return (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <Box
                      p={8}
                      bg={cardBg}
                      borderRadius="xl"
                      boxShadow="xl"
                      transition="all 0.3s"
                      _hover={{
                        transform: 'translateY(-5px)',
                        boxShadow: '2xl'
                      }}
                      height="100%"
                    >
                      <VStack spacing={4} align="flex-start" height="100%">
                        <Icon
                          as={IconComponent}
                          w={10}
                          h={10}
                          color={servico.cor || "blue.400"}
                        />
                        <Heading size="md" color={headingColor}>
                          {servico.titulo}
                        </Heading>
                        <Text color={textColor}>
                          {servico.descricao}
                        </Text>
                      </VStack>
                    </Box>
                  </MotionBox>
                );
              })}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Seção "Por que nos escolher" */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={16}
            alignItems="center"
          >
            <GridItem>
              <VStack align="flex-start" spacing={8}>
                <Heading
                  as="h2"
                  size="xl"
                  color={headingColor}
                >
                  {configs.escolherNosTexto}
                </Heading>
                <VStack align="flex-start" spacing={6} width="100%">
                  {configs.diferenciais?.map((item, index) => {
                    const IconComponent = iconMap[item.icone] || FaGlassWhiskey;
                    return (
                      <Box key={index} width="100%">
                        <HStack spacing={4} mb={2}>
                          <Icon as={IconComponent} color="blue.500" />
                          <Heading size="md" color={headingColor}>
                            {item.titulo}
                          </Heading>
                        </HStack>
                        <Text color={textColor}>
                          {item.texto}
                        </Text>
                        {index < (configs.diferenciais.length - 1) && <Divider mt={4} />}
                      </Box>
                    );
                  })}
                </VStack>
              </VStack>
            </GridItem>
            <GridItem
              display={{ base: 'none', lg: 'block' }}
              position="relative"
              height="500px"
            >
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="100%"
                height="100%"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
              >
                {configs.escolherNosFoto ? (
                  <Image
                    src={configs.escolherNosFoto}
                    alt="Por que nos escolher"
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <Box
                    width="100%"
                    height="100%"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="gray.500">
                      Adicione uma foto na seção de diferenciais
                    </Text>
                  </Box>
                )}
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Galeria de Trabalhos */}
      {configs.nossosTrabalhos?.length > 0 && (
        <Box py={20} bg={bgColor}>
          <Container maxW="container.xl">
            <VStack spacing={16}>
              <Box textAlign="center">
                <Heading
                  as="h2"
                  size="xl"
                  mb={4}
                  color={headingColor}
                >
                  Nossos Trabalhos
                </Heading>
                <Text
                  fontSize="lg"
                  color={textColor}
                  maxW="600px"
                  mx="auto"
                >
                  Conheça alguns dos nossos projetos realizados
                </Text>
              </Box>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
                width="100%"
              >
                {configs.nossosTrabalhos.map((trabalho, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Box
                      borderRadius="xl"
                      overflow="hidden"
                      boxShadow="xl"
                      bg={cardBg}
                      transition="all 0.3s"
                      _hover={{
                        transform: 'translateY(-5px)',
                        boxShadow: '2xl'
                      }}
                    >
                      <Image
                        src={trabalho.url}
                        alt={trabalho.descricao}
                        width="100%"
                        height="300px"
                        objectFit="cover"
                      />
                      {trabalho.descricao && (
                        <Box p={4}>
                          <Text
                            color={textColor}
                            fontSize="md"
                          >
                            {trabalho.descricao}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      )}
    </Box>
  );
}
