import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import api from '../services/api';

export default function HomeScreen({ route }) {
  const { user: initialUser } = route.params || { user: { id: 1, name: 'Turista', gov_verified: false } };
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('inicio');
  
  // Estados de dados
  const [guides, setGuides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Meus Contratos (Turista)
  const [myGuides, setMyGuides] = useState([]);
  const [myDrivers, setMyDrivers] = useState([]);

  // Estados do Chat
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Estados do Menu do "Boneco" / Perfil / Cadastro Profissional
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [registerType, setRegisterType] = useState(null); // 'guide' ou 'driver'
  
  // Campos para Guia
  const [specialization, setSpecialization] = useState('Ecoturismo e Trilhas');
  const [languages, setLanguages] = useState('Português, Inglês');

  // Campos para Motorista
  const [vehicleModel, setVehicleModel] = useState('Renault Duster');
  const [licensePlate, setLicensePlate] = useState('ABC-1234');
  const [capacity, setCapacity] = useState('4');

  // Estados do Modal de Acordo
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [targetProfessional, setTargetProfessional] = useState(null);
  const [agreementDate, setAgreementDate] = useState('2026-11-05');
  const [meetingPoint, setMeetingPoint] = useState('Praia dos Milionários, Ilhéus');
  const [agreedAmount, setAgreedAmount] = useState('150.00');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'guias') {
        const res = await api.get('/professional_profiles/guides');
        setGuides(res.data);
      } else if (activeTab === 'motoristas') {
        const res = await api.get('/professional_profiles/drivers');
        setDrivers(res.data);
      }
    } catch (e) {
      console.log('Erro ao buscar dados:', e);
    }
    setLoading(false);
  };

  const handleRegisterProfessional = async () => {
    try {
      if (registerType === 'guide') {
        const res = await api.post('/professional_profiles/guide', {
          user_id: user.id,
          specialization,
          languages
        });
        Alert.alert('Sucesso!', res.data.message);
        setUser({ ...user, gov_verified: true });
      } else if (registerType === 'driver') {
        const res = await api.post('/professional_profiles/driver', {
          user_id: user.id,
          vehicle_model: vehicleModel,
          license_plate: licensePlate,
          capacity: parseInt(capacity)
        });
        Alert.alert('Sucesso!', res.data.message);
        setUser({ ...user, gov_verified: true });
      }
      setRegisterType(null);
      setProfileMenuVisible(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Falha ao registrar perfil profissional.');
    }
  };

  const openAgreementModal = (professional, type) => {
    setTargetProfessional({ ...professional, type });
    setAgreedAmount(type === 'Guia' ? '150.00' : '200.00');
    setAgreementModalVisible(true);
  };

  const handleSubmitAgreement = async () => {
    try {
      const payload = {
        booking: {
          user_id: user.id,
          service_type: targetProfessional.type,
          service_id: targetProfessional.id,
          total_amount: parseFloat(agreedAmount),
          date: agreementDate,
          meeting_point: meetingPoint
        }
      };

      const response = await api.post('/bookings', payload);
      Alert.alert('Sucesso!', response.data.message);
      setAgreementModalVisible(false);
      
      if (targetProfessional.type === 'Guia') {
        if (!myGuides.some(g => g.id === targetProfessional.id)) {
          setMyGuides([...myGuides, targetProfessional]);
        }
        setActiveTab('meus guias');
      } else {
        if (!myDrivers.some(d => d.id === targetProfessional.id)) {
          setMyDrivers([...myDrivers, targetProfessional]);
        }
        setActiveTab('meus motoristas');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível enviar a proposta de acordo.');
    }
  };

  const startChat = (professionalName, type) => {
    setSelectedChatUser(`${type}: ${professionalName}`);
    setMessages([
      { id: '1', sender: 'system', text: `Chat iniciado com ${professionalName}. Tire suas dúvidas ou combine os detalhes do passeio.` }
    ]);
    setActiveTab('chat');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'me', text: newMessage }]);
    setNewMessage('');
    
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'other', text: 'Compreendido! Combinado.' }]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Olá, {user.name} 👋</Text>
          <Text style={styles.subWelcome}>Costa do Cacau • Bahia</Text>
        </View>

        {/* Botão Perfil / Boneco */}
        <TouchableOpacity style={styles.profileButton} onPress={() => setProfileMenuVisible(true)}>
          <Text style={styles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Abas de Navegação Superior */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {['inicio', 'sustentabilidade', 'guias', 'motoristas', 'meus guias', 'meus motoristas', 'painel prof.', 'chat'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Corpo / Conteúdo das Abas */}
      <View style={styles.content}>
        
        {/* ABA: INÍCIO */}
        {activeTab === 'inicio' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>🌴 Descubra a Costa do Cacau</Text>
              <Text style={styles.bannerDesc}>Praias paradisíacas, trilhas na cabruca e profissionais rigorosamente verificados pelo Gov.br.</Text>
            </View>

            <Text style={styles.sectionHeader}>Acesso Rápido</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('guias')}>
                <Text style={styles.quickCardEmoji}>🧭</Text>
                <Text style={styles.quickCardText}>Explorar Guias</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('motoristas')}>
                <Text style={styles.quickCardEmoji}>🚗</Text>
                <Text style={styles.quickCardText}>Explorar Motoristas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('painel prof.')}>
                <Text style={styles.quickCardEmoji}>🛠️</Text>
                <Text style={styles.quickCardText}>Painel Profissional</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('sustentabilidade')}>
                <Text style={styles.quickCardEmoji}>🌱</Text>
                <Text style={styles.quickCardText}>Sustentabilidade</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ABA: SUSTENTABILIDADE */}
        {activeTab === 'sustentabilidade' && (
          <ScrollView contentContainerStyle={styles.centerBox}>
            <Text style={styles.title}>🌱 Turismo Sustentável na Costa do Cacau</Text>
            <Text style={styles.desc}>
              O Cacautrip apoia o modelo agroflorestal do cacau cabruca, preservando a biodiversidade da Mata Atlântica enquanto fomenta o ecoturismo regional.
            </Text>
          </ScrollView>
        )}

        {/* ABA: GUIAS */}
        {activeTab === 'guias' && (
          <View style={styles.fullBox}>
            <Text style={styles.sectionTitle}>🧭 Guias Turísticos Certificados (Gov.br)</Text>
            {loading ? <ActivityIndicator size="large" color="#2d6a4f" style={{marginTop: 40}} /> : (
              <FlatList
                data={guides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.verifiedBadge}>🛡️ Verificado</Text>
                    </View>
                    <Text style={styles.cardInfo}>🎯 Especialidade: {item.specialization}</Text>
                    <Text style={styles.cardInfo}>🗣️ Idiomas: {item.languages}</Text>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={[styles.actionButton, {flex: 1, marginRight: 6}]} onPress={() => startChat(item.name, 'Guia')}>
                        <Text style={styles.actionButtonText}>💬 Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, {flex: 1, backgroundColor: '#1b4332', marginLeft: 6}]} onPress={() => openAgreementModal(item, 'Guia')}>
                        <Text style={[styles.actionButtonText, {color: '#fff'}]}>🤝 Fechar Acordo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum guia cadastrado no momento.</Text>}
              />
            )}
          </View>
        )}

        {/* ABA: MOTORISTAS */}
        {activeTab === 'motoristas' && (
          <View style={styles.fullBox}>
            <Text style={styles.sectionTitle}>🚗 Motoristas e Transportes (Gov.br)</Text>
            {loading ? <ActivityIndicator size="large" color="#2d6a4f" style={{marginTop: 40}} /> : (
              <FlatList
                data={drivers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.verifiedBadge}>🛡️ CNH Verificada</Text>
                    </View>
                    <Text style={styles.cardInfo}>🚙 Veículo: {item.vehicle_model} ({item.license_plate})</Text>
                    <Text style={styles.cardInfo}>👥 Capacidade: {item.capacity} passageiros</Text>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={[styles.actionButton, {flex: 1, marginRight: 6}]} onPress={() => startChat(item.name, 'Motorista')}>
                        <Text style={styles.actionButtonText}>💬 Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, {flex: 1, backgroundColor: '#1b4332', marginLeft: 6}]} onPress={() => openAgreementModal(item, 'Motorista')}>
                        <Text style={[styles.actionButtonText, {color: '#fff'}]}>🤝 Fechar Acordo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum motorista cadastrado no momento.</Text>}
              />
            )}
          </View>
        )}

        {/* ABA: MEUS GUIAS */}
        {activeTab === 'meus guias' && (
          <View style={styles.fullBox}>
            <Text style={styles.sectionTitle}>🗺️ Meus Guias Contratados</Text>
            <FlatList
              data={myGuides}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardInfo}>Especialidade: {item.specialization}</Text>
                  <TouchableOpacity style={styles.actionButton} onPress={() => startChat(item.name, 'Guia')}>
                    <Text style={styles.actionButtonText}>💬 Abrir Chat com Guia</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não fechou com nenhum guia.</Text>}
            />
          </View>
        )}

        {/* ABA: MEUS MOTORISTAS */}
        {activeTab === 'meus motoristas' && (
          <View style={styles.fullBox}>
            <Text style={styles.sectionTitle}>🚐 Meus Motoristas Contratados</Text>
            <FlatList
              data={myDrivers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardInfo}>Veículo: {item.vehicle_model} ({item.license_plate})</Text>
                  <TouchableOpacity style={styles.actionButton} onPress={() => startChat(item.name, 'Motorista')}>
                    <Text style={styles.actionButtonText}>💬 Abrir Chat com Motorista</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não fechou com nenhum motorista.</Text>}
            />
          </View>
        )}

        {/* ABA: PAINEL PROFISSIONAL */}
        {activeTab === 'painel prof.' && (
          <View style={styles.fullBox}>
            <Text style={styles.sectionTitle}>🛠️ Painel de Solicitações e Clientes</Text>
            <Text style={styles.chatSubTitle}>Gerencie os acordos propostos pelos turistas:</Text>

            <FlatList
              data={[
                { id: 1, tourist_name: 'Carlos Silva', service_type: 'Guia', date: '2026-11-05', meeting_point: 'Hotel Kairos', total_amount: 150.00, status: 'pending_approval' },
                { id: 2, tourist_name: 'Mariana Souza', service_type: 'Motorista', date: '2026-11-06', meeting_point: 'Aeroporto de Ilhéus', total_amount: 200.00, status: 'approved_waiting_payment' }
              ]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.cardTitle}>Turista: {item.tourist_name}</Text>
                    <Text style={[styles.verifiedBadge, {backgroundColor: item.status === 'pending_approval' ? '#fef3c7' : '#dcfce7', color: item.status === 'pending_approval' ? '#92400e' : '#166534'}]}>
                      {item.status === 'pending_approval' ? '⏳ Pendente' : '✅ Aceito'}
                    </Text>
                  </View>
                  <Text style={styles.cardInfo}>📅 Data: {item.date}</Text>
                  <Text style={styles.cardInfo}>📍 Local: {item.meeting_point}</Text>
                  <Text style={styles.cardInfo}>💰 Valor: R$ {item.total_amount.toFixed(2)}</Text>

                  {item.status === 'pending_approval' && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, {flex: 1, backgroundColor: '#2d6a4f', marginRight: 6}]} 
                        onPress={() => Alert.alert('Sucesso', 'Acordo aceito! O turista já pode realizar o pagamento.')}
                      >
                        <Text style={[styles.actionButtonText, {color: '#fff'}]}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, {flex: 1, backgroundColor: '#d90429', marginLeft: 6}]} 
                        onPress={() => Alert.alert('Aviso', 'Acordo recusado.')}
                      >
                        <Text style={[styles.actionButtonText, {color: '#fff'}]}>Recusar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity style={[styles.actionButton, {marginTop: 8}]} onPress={() => startChat(item.tourist_name, 'Turista')}>
                    <Text style={styles.actionButtonText}>💬 Abrir Chat com o Turista</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma solicitação pendente no momento.</Text>}
            />
          </View>
        )}

        {/* ABA: CHAT */}
        {activeTab === 'chat' && (
          <View style={styles.fullBox}>
            <Text style={styles.sectionTitle}>💬 Chat e Negociação</Text>
            <Text style={styles.chatSubTitle}>{selectedChatUser ? `Conversando com: ${selectedChatUser}` : 'Nenhuma conversa ativa selecionada.'}</Text>
            
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              style={{flex: 1, marginVertical: 8}}
              renderItem={({ item }) => (
                <View style={[styles.bubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble]}>
                  <Text style={styles.bubbleText}>{item.text}</Text>
                </View>
              )}
            />

            {selectedChatUser && (
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Digite sua mensagem..."
                  placeholderTextColor="#888"
                  value={newMessage}
                  onChangeText={setNewMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                  <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </View>

      {/* MODAL DO MENU DO "BONECO" (PERFIL E CADASTRO PROFISSIONAL) */}
      {profileMenuVisible && registerType === null && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👤 Meu Perfil</Text>
            <Text style={styles.modalSub}>{user.name} ({user.email})</Text>
            <Text style={[styles.verifiedBadge, {marginBottom: 16}]}>
              {user.gov_verified ? '🛡️ Conta Verificada no Gov.br' : '⚠️ Conta Não Verificada'}
            </Text>

            <TouchableOpacity style={styles.menuOptionButton} onPress={() => setRegisterType('guide')}>
              <Text style={styles.menuOptionText}>🧭 Quero ser Guia (Autenticar Gov.br)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOptionButton} onPress={() => setRegisterType('driver')}>
              <Text style={styles.menuOptionText}>🚗 Quero ser Motorista (Autenticar Gov.br)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelButton, {marginTop: 16}]} onPress={() => setProfileMenuVisible(false)}>
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODAL DE CADASTRO DE GUIA */}
      {registerType === 'guide' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🧭 Cadastro de Guia</Text>
            <Text style={styles.modalSub}>Validação obrigatória via Gov.br</Text>

            <Text style={styles.label}>Especialidade:</Text>
            <TextInput style={styles.inputModal} value={specialization} onChangeText={setSpecialization} />

            <Text style={styles.label}>Idiomas:</Text>
            <TextInput style={styles.inputModal} value={languages} onChangeText={setLanguages} />

            <View style={{width: '100%', marginTop: 16}}>
              <TouchableOpacity style={styles.payButton} onPress={handleRegisterProfessional}>
                <Text style={styles.buttonText}>Autenticar Gov.br & Salvar Guia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setRegisterType(null)}>
                <Text style={styles.cancelButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* MODAL DE CADASTRO DE MOTORISTA */}
      {registerType === 'driver' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚗 Cadastro de Motorista</Text>
            <Text style={styles.modalSub}>Validação obrigatória da CNH via Gov.br</Text>

            <Text style={styles.label}>Modelo do Veículo:</Text>
            <TextInput style={styles.inputModal} value={vehicleModel} onChangeText={setVehicleModel} />

            <Text style={styles.label}>Placa do Veículo:</Text>
            <TextInput style={styles.inputModal} value={licensePlate} onChangeText={setLicensePlate} />

            <Text style={styles.label}>Capacidade de Passageiros:</Text>
            <TextInput style={styles.inputModal} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

            <View style={{width: '100%', marginTop: 16}}>
              <TouchableOpacity style={styles.payButton} onPress={handleRegisterProfessional}>
                <Text style={styles.buttonText}>Autenticar Gov.br & Salvar Motorista</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setRegisterType(null)}>
                <Text style={styles.cancelButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* MODAL DE PROPOSTA DE ACORDO */}
      {agreementModalVisible && targetProfessional && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🤝 Proposta de Acordo</Text>
            <Text style={styles.modalSub}>{targetProfessional.type}: {targetProfessional.name}</Text>
            
            <Text style={styles.label}>Data do Passeio:</Text>
            <TextInput style={styles.inputModal} value={agreementDate} onChangeText={setAgreementDate} />

            <Text style={styles.label}>Ponto de Encontro:</Text>
            <TextInput style={styles.inputModal} value={meetingPoint} onChangeText={setMeetingPoint} />

            <Text style={styles.label}>Valor Acordado (R$):</Text>
            <TextInput style={styles.inputModal} value={agreedAmount} onChangeText={setAgreedAmount} keyboardType="numeric" />

            <View style={{width: '100%', marginTop: 16}}>
              <TouchableOpacity style={styles.payButton} onPress={handleSubmitAgreement}>
                <Text style={styles.buttonText}>Enviar Proposta ao Profissional</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAgreementModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f4', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  welcome: { fontSize: 20, fontWeight: 'bold', color: '#1b4332' },
  subWelcome: { fontSize: 13, color: '#52b788' },
  profileButton: { backgroundColor: '#d8f3dc', padding: 8, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  profileEmoji: { fontSize: 18 },
  
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', maxHeight: 50, paddingHorizontal: 10 },
  tabItem: { paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center' },
  activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#2d6a4f' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  activeTabText: { color: '#2d6a4f', fontWeight: 'bold' },

  content: { flex: 1, padding: 16 },
  scrollContent: { paddingBottom: 20 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  fullBox: { flex: 1 },

  banner: { backgroundColor: '#2d6a4f', padding: 20, borderRadius: 12, marginBottom: 20 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  bannerDesc: { fontSize: 13, color: '#e9f5ed', lineHeight: 18 },

  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1b4332', marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickCard: { backgroundColor: '#fff', width: '48%', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  quickCardEmoji: { fontSize: 28, marginBottom: 6 },
  quickCardText: { fontSize: 14, fontWeight: '600', color: '#2d6a4f' },

  title: { fontSize: 20, fontWeight: 'bold', color: '#2d6a4f', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#2d6a4f' },
  chatSubTitle: { fontSize: 12, color: '#666', marginBottom: 10, fontStyle: 'italic' },

  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1b4332', marginBottom: 4 },
  cardInfo: { fontSize: 13, color: '#555', marginBottom: 2 },
  verifiedBadge: { fontSize: 11, fontWeight: 'bold', color: '#2d6a4f', backgroundColor: '#d8f3dc', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  cardActions: { flexDirection: 'row', marginTop: 10 },
  actionButton: { backgroundColor: '#d8f3dc', padding: 10, borderRadius: 6, alignItems: 'center' },
  actionButtonText: { color: '#2d6a4f', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30 },

  bubble: { padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: '80%' },
  myBubble: { backgroundColor: '#d8f3dc', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ddd' },
  bubbleText: { fontSize: 13, color: '#333' },

  chatInputContainer: { flexDirection: 'row', marginTop: 8 },
  chatInput: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  sendButton: { backgroundColor: '#2d6a4f', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', width: '100%', maxWidth: 400, padding: 24, borderRadius: 12, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b4332', marginBottom: 4 },
  modalSub: { fontSize: 14, color: '#555', marginBottom: 12 },

  menuOptionButton: { backgroundColor: '#f0fdf4', padding: 14, borderRadius: 8, width: '100%', marginBottom: 10, borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center' },
  menuOptionText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },

  label: { fontSize: 12, fontWeight: 'bold', color: '#333', alignSelf: 'flex-start', marginTop: 8, marginBottom: 4 },
  inputModal: { backgroundColor: '#f9f9f9', width: '100%', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', marginBottom: 6 },

  payButton: { backgroundColor: '#1b4332', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  cancelButton: { marginTop: 10, padding: 10, alignItems: 'center' },
  cancelButtonText: { color: '#d90429', fontWeight: 'bold', fontSize: 13 }
});