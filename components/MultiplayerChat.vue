<template>
  <div class="chat-container glass-panel">
    <div class="chat-messages" ref="msgContainer">
      <div v-if="messages.length === 0" class="empty-chat">No messages yet...</div>
      <div v-for="(msg, i) in messages" :key="i" class="chat-msg">
        <span class="msg-sender" :class="{ 'me': msg.userId === userId }">{{ msg.username }}:</span>
        <span class="msg-text">{{ msg.text }}</span>
      </div>
    </div>
    <div class="chat-input-row">
      <input 
        v-model="inputText" 
        @keyup.enter="sendMessage"
        placeholder="Type a message..." 
        class="chat-input"
        maxlength="100"
      />
      <button @click="sendMessage" class="send-btn">SEND</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  roomId: string;
  userId: string;
  username: string;
  messages: any[];
}>();

const inputText = ref('');
const msgContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  }
}

watch(() => props.messages, () => {
  nextTick(() => scrollToBottom());
}, { deep: true });

async function sendMessage() {
  if (!inputText.value.trim()) return;
  const text = inputText.value.trim();
  inputText.value = ''; // clear immediately

  try {
    await $fetch(`/api/rooms/${props.roomId}/chat`, {
      method: 'POST',
      body: {
        userId: props.userId,
        username: props.username,
        text
      }
    });
  } catch (e) {
    console.error('Failed to send message', e);
  }
}
</script>

<style scoped>
.chat-container {
  display: flex; flex-direction: column;
  height: 100%; min-height: 300px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  text-align: left;
}

.empty-chat {
  color: #666; font-style: italic; text-align: center; margin-top: 2rem;
}

.chat-msg {
  font-size: 0.9rem;
  word-wrap: break-word;
}

.msg-sender {
  font-weight: bold; margin-right: 0.5rem; color: #aaa;
}
.msg-sender.me {
  color: #00ffff;
}

.msg-text {
  color: #fff;
}

.chat-input-row {
  display: flex;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 0.5rem;
  font-family: inherit;
}
.chat-input:focus { outline: none; }

.send-btn {
  background: #00ffff; color: #000; font-weight: bold; border: none;
  padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer;
}
</style>
