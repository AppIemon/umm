<template>
  <div class="auth-page">
    <div class="background-anim"></div>
    <div class="auth-card">
      <h1 class="glitch-title" data-text="로그인">로그인</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>사용자명</label>
          <input v-model="username" type="text" placeholder="아이디 입력" required />
        </div>
        
        <div class="input-group">
          <label>비밀번호</label>
          <input v-model="password" type="password" placeholder="********" required />
        </div>

        <button type="submit" class="cta-btn">로그인</button>
      </form>

      <div class="divider">-- 또는 --</div>

      <button @click="loginAsGuest" class="guest-btn">게스트 모드</button>

      <div class="footer-link">
        계정이 없으신가요? <NuxtLink to="/register">회원가입</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { login, loginAsGuest } = useAuth();
const username = ref('');
const password = ref('');

const handleLogin = () => {
  if (username.value.length < 3) {
      alert('Identifier too short');
      return;
  }
  login(username.value, password.value);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #050510;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 60% 50%, #1a1a3a 0%, #000 100%);
  z-index: 0;
}

.auth-card {
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.glitch-title {
  font-size: 2.5rem;
  color: #4d94ff;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(77, 148, 255, 0.4);
  font-weight: 900;
  letter-spacing: 2px;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  font-family: inherit;
  transition: all 0.2s;
  border-radius: 8px;
}

.input-group input:focus {
  border-color: #4d94ff;
  outline: none;
  box-shadow: 0 0 10px rgba(77, 148, 255, 0.2);
  background: rgba(77, 148, 255, 0.1);
}

.cta-btn {
  width: 100%;
  padding: 1rem;
  background: #4d94ff;
  color: white;
  border: none;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(77, 148, 255, 0.3);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(77, 148, 255, 0.5);
}

.divider {
  text-align: center;
  color: #555;
  margin: 1rem 0;
  font-size: 0.8rem;
}

.guest-btn {
  width: 100%;
  padding: 0.8rem;
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  font-weight: bold;
}

.guest-btn:hover {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.footer-link {
  text-align: center;
  margin-top: 2rem;
  color: #666;
}

.footer-link a {
  color: #4d94ff;
  text-decoration: none;
  font-weight: bold;
}

.footer-link a:hover {
  text-decoration: underline;
}
</style>
