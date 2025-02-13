import { db } from '../config/firebase';
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'services';

export const addService = async (serviceData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...serviceData,
      createdAt: new Date().toISOString()
    });

    return {
      id: docRef.id,
      ...serviceData
    };
  } catch (erro) {
    console.error('Erro ao adicionar serviço:', erro);
    throw erro;
  }
};

export const getAllServices = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const services = [];
    
    querySnapshot.forEach((doc) => {
      services.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Ordenar por data de criação (mais recentes primeiro)
    return services.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (erro) {
    console.error('Erro ao buscar serviços:', erro);
    throw erro;
  }
};

export const updateService = async (id, serviceData) => {
  try {
    const serviceRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(serviceRef, {
      ...serviceData,
      updatedAt: new Date().toISOString()
    });

    return {
      id,
      ...serviceData
    };
  } catch (erro) {
    console.error('Erro ao atualizar serviço:', erro);
    throw erro;
  }
};

export const deleteService = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (erro) {
    console.error('Erro ao deletar serviço:', erro);
    throw erro;
  }
};
