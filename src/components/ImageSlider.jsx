import { useState, useEffect, useCallback } from 'react';
import { Box, Image, IconButton, Flex, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getAllImages } from '../models/Image';

function ImageSlider() {
  const [imagens, setImagens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    carregarImagens();
  }, []);

  useEffect(() => {
    let timer;
    if (imagens.length > 0 && autoPlayEnabled && !isOpen) {
      timer = setInterval(() => {
        handleNextSlide();
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [imagens, currentIndex, autoPlayEnabled, isOpen]);

  const carregarImagens = async () => {
    try {
      const imagensCarregadas = await getAllImages();
      setImagens(imagensCarregadas);
    } catch (erro) {
      console.error('Erro ao carregar imagens:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleSlideChange = useCallback((newIndex) => {
    setIsChanging(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsChanging(false);
    }, 300);
  }, []);

  const handleNextSlide = useCallback(() => {
    const newIndex = currentIndex === imagens.length - 1 ? 0 : currentIndex + 1;
    handleSlideChange(newIndex);
  }, [currentIndex, imagens.length, handleSlideChange]);

  const handlePrevSlide = useCallback(() => {
    const newIndex = currentIndex === 0 ? imagens.length - 1 : currentIndex - 1;
    handleSlideChange(newIndex);
  }, [currentIndex, imagens.length, handleSlideChange]);

  const handleManualNavigation = useCallback((index) => {
    setAutoPlayEnabled(false);
    handleSlideChange(index);
  }, [handleSlideChange]);

  const handleImageClick = useCallback(() => {
    setAutoPlayEnabled(false);
    onOpen();
  }, [onOpen]);

  if (carregando || imagens.length === 0) {
    return (
      <Box
        w="100%"
        h="100%"
        bg="gray.200"
      />
    );
  }

  return (
    <>
      <Box 
        position="relative" 
        w="100%" 
        h="100%" 
        overflow="hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setAutoPlayEnabled(true);
        }}
      >
        <Image
          src={imagens[currentIndex].url}
          alt={`Slide ${currentIndex + 1}`}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center"
          opacity={isChanging ? 0 : 1}
          transition="opacity 0.3s ease-in-out"
          cursor="pointer"
          onClick={handleImageClick}
          zIndex="1"
        />

        {/* Indicadores de navegação */}
        <Flex
          position="absolute"
          bottom="6"
          left="50%"
          transform="translateX(-50%)"
          zIndex="3"
          bg="blackAlpha.500"
          p="3"
          borderRadius="full"
          transition="opacity 0.3s"
          opacity={isHovered ? 1 : 0.7}
          pointerEvents="auto"
        >
          {imagens.map((_, index) => (
            <Box
              key={index}
              w="4"
              h="4"
              mx="2"
              borderRadius="full"
              bg={index === currentIndex ? "white" : "whiteAlpha.600"}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleManualNavigation(index);
              }}
              transition="all 0.2s"
              _hover={{ 
                transform: "scale(1.2)", 
                bg: "white",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)"
              }}
            />
          ))}
        </Flex>

        {/* Botões de navegação */}
        <IconButton
          aria-label="Slide anterior"
          icon={<FaChevronLeft size="24px" />}
          position="absolute"
          left="4"
          top="50%"
          transform="translateY(-50%)"
          onClick={(e) => {
            e.stopPropagation();
            setAutoPlayEnabled(false);
            handlePrevSlide();
          }}
          zIndex="3"
          size="lg"
          opacity={isHovered ? 0.9 : 0}
          transition="all 0.3s"
          _hover={{ 
            opacity: 1,
            transform: "translateY(-50%) scale(1.1)",
            bg: "blackAlpha.700"
          }}
          bg="blackAlpha.600"
          color="white"
          pointerEvents="auto"
        />

        <IconButton
          aria-label="Próximo slide"
          icon={<FaChevronRight size="24px" />}
          position="absolute"
          right="4"
          top="50%"
          transform="translateY(-50%)"
          onClick={(e) => {
            e.stopPropagation();
            setAutoPlayEnabled(false);
            handleNextSlide();
          }}
          zIndex="3"
          size="lg"
          opacity={isHovered ? 0.9 : 0}
          transition="all 0.3s"
          _hover={{ 
            opacity: 1,
            transform: "translateY(-50%) scale(1.1)",
            bg: "blackAlpha.700"
          }}
          bg="blackAlpha.600"
          color="white"
          pointerEvents="auto"
        />
      </Box>

      {/* Modal para visualizar a imagem em tamanho maior */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
        <ModalContent bg="transparent" boxShadow="none" mx={4}>
          <ModalBody p={0}>
            <Box
              position="relative"
              width="100%"
              paddingTop="56.25%" // Proporção 16:9
              overflow="hidden"
              borderRadius="xl"
            >
              <Image
                src={imagens[currentIndex].url}
                alt={`Slide ${currentIndex + 1}`}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                maxW="100%"
                maxH="90vh"
                objectFit="contain"
                onClick={onClose}
                cursor="pointer"
                transition="transform 0.3s ease-in-out"
                _hover={{ transform: "translate(-50%, -50%) scale(1.02)" }}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ImageSlider;
