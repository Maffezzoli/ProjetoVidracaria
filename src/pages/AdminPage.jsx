import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  HStack,
  useDisclosure,
  useToast,
  Icon,
  Image,
  Flex,
  IconButton,
  Progress,
  Divider,
  Select
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaGlasses, FaWindowMaximize, FaDoorOpen, FaHome, FaTools, FaWrench, FaHammer, FaRuler, FaShieldAlt, FaGem, FaPlus, FaGlassWhiskey, FaAward, FaClock, FaHandshake } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { addImage, deleteSliderImage, getAllImages } from '../models/Image';
import { addService, getAllServices, updateService, deleteService } from '../models/Service';
import { getConfig, saveConfig } from '../models/Config';
import { uploadImage } from '../services/cloudinaryService';

export default function AdminPage() {
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [imagens, setImagens] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [progresso, setProgresso] = useState(0);
  const [servicoAtual, setServicoAtual] = useState(null);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    icone: ''
  });
  const [configs, setConfigs] = useState({
    titulo: '',
    subtitulo: '',
    logoUrl: '',
    faviconUrl: '',
    whatsapp: '', // Novo campo
    escolherNosTexto: '',
    escolherNosFoto: '',
    diferenciais: [],
    nossosTrabalhos: [],
    servicos: []
  });

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    carregarImagens();
    carregarServicos();
    carregarConfigs();
  }, []);

  // Se não estiver autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" />;
  }

  const carregarImagens = async () => {
    try {
      const imagensCarregadas = await getAllImages();
      setImagens(imagensCarregadas);
    } catch (erro) {
      toast({
        title: 'Erro ao carregar imagens',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const carregarServicos = async () => {
    try {
      const servicosCarregados = await getAllServices();
      setServicos(servicosCarregados);
    } catch (erro) {
      toast({
        title: 'Erro ao carregar serviços',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const carregarConfigs = async () => {
    try {
      const configsCarregadas = await getConfig();
      setConfigs(configsCarregadas);
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
      toast({
        title: 'Erro ao carregar configurações',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleUploadImagem = async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    try {
      setCarregando(true);
      setProgresso(0);

      // Simula progresso de upload
      const intervalo = setInterval(() => {
        setProgresso(prev => Math.min(prev + 10, 90));
      }, 500);

      await addImage(arquivo);
      
      clearInterval(intervalo);
      setProgresso(100);

      toast({
        title: 'Imagem enviada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await carregarImagens();
    } catch (erro) {
      toast({
        title: 'Erro ao enviar imagem',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCarregando(false);
      setProgresso(0);
    }
  };

  const handleDeletarImagem = async (id, publicId) => {
    try {
      setCarregando(true);
      await deleteSliderImage(id, publicId);
      await carregarImagens();
      
      toast({
        title: 'Imagem removida com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (erro) {
      toast({
        title: 'Erro ao remover imagem',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleServicoSubmit = async (e) => {
    e.preventDefault();
    try {
      setCarregando(true);
      
      if (servicoAtual) {
        await updateService(servicoAtual.id, novoServico);
        toast({
          title: 'Serviço atualizado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await addService(novoServico);
        toast({
          title: 'Serviço adicionado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      setNovoServico({ nome: '', descricao: '', icone: '' });
      setServicoAtual(null);
      await carregarServicos();
      onClose();
    } catch (erro) {
      toast({
        title: 'Erro ao salvar serviço',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCarregando(false);
    }
  };

  const editarServico = (servico) => {
    setServicoAtual(servico);
    setNovoServico({
      nome: servico.nome,
      descricao: servico.descricao,
      icone: servico.icone
    });
    onOpen();
  };

  const excluirServico = async (id) => {
    try {
      setCarregando(true);
      await deleteService(id);
      await carregarServicos();
      
      toast({
        title: 'Serviço removido com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (erro) {
      toast({
        title: 'Erro ao remover serviço',
        description: erro.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCarregando(false);
    }
  };

  const salvarConfigs = async () => {
    try {
      setIsSaving(true);
      const resultado = await saveConfig({
        ...configs,
        servicos: configs.servicos || [],
        diferenciais: configs.diferenciais || [],
        nossosTrabalhos: configs.nossosTrabalhos || []
      });

      if (resultado) {
        toast({
          title: 'Configurações salvas!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Atualiza o favicon
        if (configs.faviconUrl) {
          const favicon = document.querySelector('link[rel="icon"]');
          if (favicon) {
            favicon.href = configs.faviconUrl;
          }
        }
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (erro) {
      console.error('Erro ao salvar:', erro);
      toast({
        title: 'Erro ao salvar configurações',
        description: erro.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setCarregando(true);
        const result = await uploadImage(file);
        if (result && result.url) {
          const novasConfigs = {
            ...configs,
            logoUrl: result.url,
            faviconUrl: result.url
          };
          await saveConfig(novasConfigs);
          setConfigs(novasConfigs);
          toast({
            title: 'Logo atualizada com sucesso!',
            status: 'success',
            duration: 3000,
            isClosable: true
          });
        }
      } catch (erro) {
        console.error('Erro ao fazer upload da logo:', erro);
        toast({
          title: 'Erro ao fazer upload da logo',
          description: erro.message,
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } finally {
        setCarregando(false);
      }
    }
  };

  // Lista de ícones disponíveis
  const icones = {
    'FaGlasses': FaGlasses,
    'FaWindowMaximize': FaWindowMaximize,
    'FaDoorOpen': FaDoorOpen,
    'FaHome': FaHome,
    'FaTools': FaTools,
    'FaWrench': FaWrench,
    'FaHammer': FaHammer,
    'FaRuler': FaRuler,
    'FaShieldAlt': FaShieldAlt,
    'FaGem': FaGem
  };

  return (
    <Box ml="250px" p={5}>
      <Container maxW="container.xl" pt={20}>
        <Heading mb={6}>Painel Administrativo</Heading>
        
        <Tabs>
          <TabList>
            <Tab>Imagens</Tab>
            <Tab>Configurações</Tab>
          </TabList>

          <TabPanels>
            {/* Painel de Imagens */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <FormControl>
                    <FormLabel>Adicionar Nova Imagem</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImagem}
                      disabled={carregando}
                    />
                  </FormControl>
                  {progresso > 0 && (
                    <Progress 
                      value={progresso} 
                      size="sm" 
                      colorScheme="blue" 
                      mt={2}
                    />
                  )}
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {imagens.map((imagem) => (
                    <Box key={imagem.id} position="relative">
                      <Image
                        src={imagem.url}
                        alt="Imagem do slider"
                        borderRadius="md"
                        w="100%"
                        h="200px"
                        objectFit="cover"
                      />
                      <IconButton
                        icon={<FaTrash />}
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="red"
                        onClick={() => handleDeletarImagem(imagem.id, imagem.publicId)}
                        isLoading={carregando}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Painel de Configurações */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Logo */}
                <Box>
                  <FormControl>
                    <FormLabel>Logo do Site</FormLabel>
                    <VStack spacing={4} align="start">
                      {configs.logoUrl && (
                        <Image
                          src={configs.logoUrl}
                          alt="Logo do site"
                          boxSize="100px"
                          objectFit="contain"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <Text fontSize="sm" color="gray.500">
                        A imagem será usada como logo e favicon do site
                      </Text>
                    </VStack>
                  </FormControl>
                </Box>

                <Divider />

                {/* Textos */}
                <Box>
                  <FormControl>
                    <FormLabel>Título Principal</FormLabel>
                    <Input
                      value={configs.titulo}
                      onChange={(e) => setConfigs(prev => ({
                        ...prev,
                        titulo: e.target.value
                      }))}
                      placeholder="Ex: Vidraçaria Geovane Vidros"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Subtítulo</FormLabel>
                    <Input
                      value={configs.subtitulo}
                      onChange={(e) => setConfigs(prev => ({
                        ...prev,
                        subtitulo: e.target.value
                      }))}
                      placeholder="Ex: Qualidade e excelência em serviços de vidraçaria"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Texto "Por que nos escolher"</FormLabel>
                    <Textarea
                      value={configs.escolherNosTexto || ''}
                      onChange={(e) => setConfigs({ ...configs, escolherNosTexto: e.target.value })}
                    />
                  </FormControl>
                </Box>

                <Divider />

                {/* WhatsApp */}
                <Box>
                  <FormControl>
                    <FormLabel>WhatsApp</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>+55</InputLeftAddon>
                      <Input
                        type="tel"
                        placeholder="DDD + Número"
                        value={configs.whatsapp}
                        onChange={(e) => {
                          // Remove caracteres não numéricos
                          const numero = e.target.value.replace(/\D/g, '');
                          if (numero.length <= 11) { // Limita a 11 dígitos (DDD + número)
                            setConfigs({ ...configs, whatsapp: numero });
                          }
                        }}
                        maxLength={11}
                      />
                    </InputGroup>
                    <FormHelperText>Digite apenas números (DDD + número)</FormHelperText>
                  </FormControl>
                </Box>

                <Divider />

                {/* Diferenciais */}
                <Box>
                  <Heading size="md" mb={4}>
                    Diferenciais
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    {(configs.diferenciais || []).map((diferencial, index) => (
                      <Box key={index} p={4} bg="gray.50" borderRadius="md">
                        <VStack spacing={4} align="stretch">
                          <FormControl>
                            <FormLabel>Título do Diferencial</FormLabel>
                            <Input
                              value={diferencial.titulo || ''}
                              onChange={(e) => {
                                const novosDiferenciais = [...(configs.diferenciais || [])];
                                novosDiferenciais[index] = {
                                  ...diferencial,
                                  titulo: e.target.value
                                };
                                setConfigs({ ...configs, diferenciais: novosDiferenciais });
                              }}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Texto do Diferencial</FormLabel>
                            <Textarea
                              value={diferencial.texto || ''}
                              onChange={(e) => {
                                const novosDiferenciais = [...(configs.diferenciais || [])];
                                novosDiferenciais[index] = {
                                  ...diferencial,
                                  texto: e.target.value
                                };
                                setConfigs({ ...configs, diferenciais: novosDiferenciais });
                              }}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Ícone</FormLabel>
                            <Select
                              value={diferencial.icone || 'FaAward'}
                              onChange={(e) => {
                                const novosDiferenciais = [...(configs.diferenciais || [])];
                                novosDiferenciais[index] = {
                                  ...diferencial,
                                  icone: e.target.value
                                };
                                setConfigs({ ...configs, diferenciais: novosDiferenciais });
                              }}
                            >
                              <option value="FaAward">Prêmio</option>
                              <option value="FaShieldAlt">Escudo</option>
                              <option value="FaClock">Relógio</option>
                              <option value="FaTools">Ferramentas</option>
                              <option value="FaHandshake">Aperto de Mão</option>
                            </Select>
                          </FormControl>

                          <Button
                            colorScheme="red"
                            onClick={() => {
                              const novosDiferenciais = [...(configs.diferenciais || [])];
                              novosDiferenciais.splice(index, 1);
                              setConfigs({ ...configs, diferenciais: novosDiferenciais });
                            }}
                            leftIcon={<FaTrash />}
                          >
                            Remover Diferencial
                          </Button>
                        </VStack>
                      </Box>
                    ))}

                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        const novoDiferencial = {
                          titulo: '',
                          texto: '',
                          icone: 'FaAward'
                        };
                        setConfigs({
                          ...configs,
                          diferenciais: [
                            ...(configs.diferenciais || []),
                            novoDiferencial
                          ]
                        });
                      }}
                      leftIcon={<FaPlus />}
                    >
                      Adicionar Diferencial
                    </Button>
                  </VStack>
                </Box>

                <Box mt={8}>
                  <Heading size="md" mb={4}>
                    Nossos Trabalhos
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {configs.nossosTrabalhos?.map((trabalho, index) => (
                      <Box key={index} p={4} bg="gray.50" borderRadius="md">
                        <VStack spacing={4}>
                          <Image
                            src={trabalho.url}
                            alt={trabalho.descricao}
                            maxH="200px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <FormControl>
                            <FormLabel>Descrição</FormLabel>
                            <Input
                              value={trabalho.descricao}
                              onChange={(e) => {
                                const novosTrabalhos = [...(configs.nossosTrabalhos || [])];
                                novosTrabalhos[index] = {
                                  ...trabalho,
                                  descricao: e.target.value
                                };
                                setConfigs({ ...configs, nossosTrabalhos: novosTrabalhos });
                              }}
                            />
                          </FormControl>
                          <Button
                            colorScheme="red"
                            size="sm"
                            leftIcon={<FaTrash />}
                            onClick={() => {
                              const novosTrabalhos = [...(configs.nossosTrabalhos || [])];
                              novosTrabalhos.splice(index, 1);
                              setConfigs({ ...configs, nossosTrabalhos: novosTrabalhos });
                            }}
                          >
                            Remover
                          </Button>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                  
                  <FormControl mt={4}>
                    <FormLabel>Adicionar Novo Trabalho</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const result = await uploadImage(file);
                          if (result && result.url) {
                            const novosTrabalhos = [...(configs.nossosTrabalhos || [])];
                            novosTrabalhos.push({
                              url: result.url,
                              descricao: ''
                            });
                            setConfigs({ ...configs, nossosTrabalhos: novosTrabalhos });
                          }
                        }
                      }}
                    />
                  </FormControl>
                </Box>

                <Box mt={8}>
                  <Heading size="md" mb={4}>
                    Serviços
                  </Heading>

                  {(configs.servicos || []).map((servico, index) => (
                    <Box key={index} p={4} bg="gray.50" borderRadius="md" mb={4}>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Título do Serviço</FormLabel>
                          <Input
                            value={servico.titulo || ''}
                            onChange={(e) => {
                              const novosServicos = [...configs.servicos];
                              novosServicos[index] = {
                                ...servico,
                                titulo: e.target.value
                              };
                              setConfigs({ ...configs, servicos: novosServicos });
                            }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Descrição</FormLabel>
                          <Textarea
                            value={servico.descricao || ''}
                            onChange={(e) => {
                              const novosServicos = [...configs.servicos];
                              novosServicos[index] = {
                                ...servico,
                                descricao: e.target.value
                              };
                              setConfigs({ ...configs, servicos: novosServicos });
                            }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Ícone</FormLabel>
                          <Select
                            value={servico.icone || 'FaGlassWhiskey'}
                            onChange={(e) => {
                              const novosServicos = [...configs.servicos];
                              novosServicos[index] = {
                                ...servico,
                                icone: e.target.value
                              };
                              setConfigs({ ...configs, servicos: novosServicos });
                            }}
                          >
                            <option value="FaGlassWhiskey">Vidro</option>
                            <option value="FaHome">Casa</option>
                            <option value="FaBuilding">Prédio</option>
                            <option value="FaIndustry">Indústria</option>
                            <option value="FaTools">Ferramentas</option>
                            <option value="FaWrench">Chave Inglesa</option>
                            <option value="FaHammer">Martelo</option>
                            <option value="FaRuler">Régua</option>
                            <option value="FaGem">Gema</option>
                            <option value="FaAward">Prêmio</option>
                            <option value="FaShieldAlt">Escudo</option>
                            <option value="FaClock">Relógio</option>
                            <option value="FaHandshake">Aperto de Mão</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Cor do Ícone</FormLabel>
                          <Input
                            type="color"
                            value={servico.cor || '#4299E1'}
                            onChange={(e) => {
                              const novosServicos = [...configs.servicos];
                              novosServicos[index] = {
                                ...servico,
                                cor: e.target.value
                              };
                              setConfigs({ ...configs, servicos: novosServicos });
                            }}
                          />
                        </FormControl>

                        <Button
                          colorScheme="red"
                          onClick={() => {
                            const novosServicos = [...configs.servicos];
                            novosServicos.splice(index, 1);
                            setConfigs({ ...configs, servicos: novosServicos });
                          }}
                          leftIcon={<FaTrash />}
                        >
                          Remover Serviço
                        </Button>
                      </VStack>
                    </Box>
                  ))}

                  <Button
                    colorScheme="blue"
                    leftIcon={<FaPlus />}
                    onClick={() => {
                      const novoServico = {
                        titulo: '',
                        descricao: '',
                        icone: 'FaGlassWhiskey',
                        cor: '#4299E1'
                      };
                      setConfigs({
                        ...configs,
                        servicos: [...(configs.servicos || []), novoServico]
                      });
                    }}
                  >
                    Adicionar Novo Serviço
                  </Button>
                </Box>

                <Button
                  colorScheme="blue"
                  onClick={salvarConfigs}
                  isLoading={isSaving}
                >
                  Salvar Configurações
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modal de Serviço */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {servicoAtual ? 'Editar Serviço' : 'Novo Serviço'}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleServicoSubmit}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <Input
                      value={novoServico.nome}
                      onChange={(e) => setNovoServico({
                        ...novoServico,
                        nome: e.target.value
                      })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Descrição</FormLabel>
                    <Textarea
                      value={novoServico.descricao}
                      onChange={(e) => setNovoServico({
                        ...novoServico,
                        descricao: e.target.value
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Ícone</FormLabel>
                    <SimpleGrid columns={5} spacing={4} mb={4}>
                      {Object.entries(icones).map(([nome, Icone]) => (
                        <Box
                          key={nome}
                          p={2}
                          cursor="pointer"
                          borderWidth={1}
                          borderRadius="md"
                          borderColor={novoServico.icone === nome ? "blue.500" : "gray.200"}
                          onClick={() => setNovoServico({
                            ...novoServico,
                            icone: nome
                          })}
                          _hover={{ bg: "gray.50" }}
                        >
                          <VStack>
                            <Icon as={Icone} w={6} h={6} />
                            <Text fontSize="xs">{nome.replace('Fa', '')}</Text>
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={carregando}
                >
                  {servicoAtual ? 'Atualizar' : 'Salvar'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}
