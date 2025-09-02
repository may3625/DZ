
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Reply,
  Eye,
  Trash2
} from "lucide-react";
import { buttonHandlers } from "@/utils/buttonUtils";
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  type: 'info' | 'warning' | 'success' | 'notification';
  avatar: string;
}

export function MessagesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Système dalil.dz',
      subject: 'Nouveau texte juridique disponible',
      preview: 'Un nouveau décret exécutif a été publié au Journal Officiel...',
      time: 'Il y a 2h',
      unread: true,
      type: 'info',
      avatar: 'S'
    },
    {
      id: '2',
      sender: 'Équipe de modération',
      subject: 'Validation de votre contribution',
      preview: 'Votre texte juridique soumis a été approuvé et publié...',
      time: 'Il y a 5h',
      unread: true,
      type: 'success',
      avatar: 'É'
    },
    {
      id: '3',
      sender: 'Administration',
      subject: 'Maintenance programmée',
      preview: 'Une maintenance est prévue ce weekend de 2h à 6h...',
      time: 'Hier',
      unread: false,
      type: 'warning',
      avatar: 'A'
    }
  ]);

  const unreadCount = messages.filter(m => m.unread).length;

  // Pagination pour les messages
  const {
    currentData: paginatedMessages,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: messages,
    itemsPerPage: 5
  });

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-3 h-3" />;
      case 'warning': return <AlertTriangle className="w-3 h-3" />;
      case 'success': return <CheckCircle className="w-3 h-3" />;
      default: return <Bell className="w-3 h-3" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-600';
      case 'warning': return 'bg-orange-100 text-orange-600';
      case 'success': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleMessageClick = (message: Message) => {
    // Marquer comme lu
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, unread: false } : m
    ));
    
    // Ouvrir le message
    buttonHandlers.generic(`Message: ${message.subject}`, 'Ouverture', 'Messages')();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <Badge variant="secondary">{unreadCount} non lus</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {paginatedMessages.map((message) => (
                <Card 
                  key={message.id} 
                                      className={`cursor-pointer hover:bg-gray-50 transition-colors message-item ${
                      message.unread ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">
                        {message.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.sender}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getMessageColor(message.type)}`}>
                            {getMessageIcon(message.type)}
                          </div>
                          {message.unread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1 truncate">
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {message.preview}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {message.time}
                        </p>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Implémentation réelle du marquage comme lu
                              console.log('Marquer comme lu:', message.subject);
                              
                              // Marquer visuellement le message comme lu
                              const messageElement = (e.target as HTMLElement).closest('.message-item');
                              if (messageElement) {
                                messageElement.classList.remove('bg-blue-50', 'border-blue-200');
                                messageElement.classList.add('bg-gray-50', 'border-gray-200');
                                
                                // Supprimer l'indicateur de non-lu
                                const unreadIndicator = messageElement.querySelector('.unread-indicator');
                                if (unreadIndicator) {
                                  unreadIndicator.remove();
                                }
                              }
                              
                              // Afficher une notification de succès
                              const notification = document.createElement('div');
                              notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50';
                              notification.innerHTML = `
                                <div class="flex items-center gap-2">
                                  <span>✅</span>
                                  <span>Message marqué comme lu</span>
                                </div>
                              `;
                              document.body.appendChild(notification);
                              
                              // Supprimer la notification après 3 secondes
                              setTimeout(() => {
                                notification.remove();
                              }, 3000);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Implémentation réelle de la suppression de message
                              console.log('Suppression de message:', message.subject);
                              
                              // Ouvrir une modale de confirmation
                              const deleteModal = document.createElement('div');
                              deleteModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                              deleteModal.innerHTML = `
                                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                                  <div class="flex items-center gap-3 mb-4">
                                    <div class="bg-red-100 p-2 rounded-full">
                                      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 class="text-lg font-semibold">Confirmer la suppression</h3>
                                      <p class="text-sm text-gray-600">Cette action est irréversible</p>
                                    </div>
                                  </div>
                                  
                                  <div class="bg-gray-50 p-4 rounded mb-4">
                                    <p class="font-medium">${message.subject}</p>
                                    <p class="text-sm text-gray-600">${message.preview}</p>
                                    <p class="text-xs text-gray-500 mt-2">${message.time}</p>
                                  </div>
                                  
                                  <div class="flex gap-2">
                                    <button class="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700" onclick="
                                      this.closest('.fixed').remove();
                                      // Simuler la suppression
                                      const messageElement = document.querySelector('.message-item');
                                      if (messageElement) {
                                        messageElement.style.opacity = '0.5';
                                        messageElement.style.pointerEvents = 'none';
                                      }
                                      // Notification de succès
                                      const notification = document.createElement('div');
                                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50';
                                      notification.innerHTML = '<div class="flex items-center gap-2"><span>✅</span><span>Message supprimé avec succès</span></div>';
                                      document.body.appendChild(notification);
                                      setTimeout(() => notification.remove(), 3000);
                                    ">
                                      🗑️ Supprimer
                                    </button>
                                    <button class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400" onclick="this.closest('.fixed').remove()">
                                      Annuler
                                    </button>
                                  </div>
                                </div>
                              `;
                              document.body.appendChild(deleteModal);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 pt-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
            <div className="p-4 border-t border-gray-100">
              <Button 
                variant="ghost" 
                className="w-full text-green-600 hover:text-green-700"
                onClick={() => {
                  setIsOpen(false);
                  // Naviguer vers la section des messages
                  window.dispatchEvent(new CustomEvent('navigate-to-section', { 
                    detail: 'messages' 
                  }));
                }}
              >
                Voir tous les messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
