import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth'; // Para pegar o usuário logado

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // Salva a venda na coleção do usuário logado
  async salvarVenda(venda: any) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const vendasCollection = collection(this.firestore, `usuarios/${user.uid}/vendas`);
    return addDoc(vendasCollection, venda);
  }
}
