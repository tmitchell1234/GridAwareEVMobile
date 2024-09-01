import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated, Easing, Dimensions } from 'react-native';

const fakeNotifications = [
  {
    id: 1,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  
  {
    id: 2,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 3,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 4,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 5,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 6,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 7,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 8,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 9,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
  {
    id: 10,
    title: "Grid Power Regulation",
    date: "[Date],[Time]",
    content: "The device detected a fluctuation in the power grid frequency. Failure resulted from ... Hardware system regulation was activated.",
  },
];

const Notifications = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const openModal = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedNotification(null);
    });
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Notifications</Text>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {fakeNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationCard}
              onPress={() => openModal(notification)}
            >
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationContent}>{notification.date}, {notification.content.slice(0, 50)}...</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {modalVisible && selectedNotification && (
          <Modal transparent={true} animationType="none" visible={modalVisible}>
            <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                <Text style={styles.modalDate}>{selectedNotification.date}</Text>
                <Text style={styles.modalContent}>{selectedNotification.content}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#FF6F3C',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationContent: {
    fontSize: 14,
    color: '#F3F3F3',
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#1A1E3A',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6F3C',
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 15,
  },
  modalContent: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default Notifications;
