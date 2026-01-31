<template>
  <div class="auth-page">
    <div class="background-anim"></div>
    <div class="auth-card">
      <h1 class="glitch-title">회원가입</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label>사용자명</label>
          <input v-model="username" type="text" placeholder="아이디 입력" required />
        </div>
        
        <div class="input-group">
          <label>비밀번호</label>
          <input v-model="password" type="password" placeholder="********" required />
        </div>

        <div class="input-group">
          <label>비밀번호 확인</label>
          <input v-model="confirmPassword" type="password" placeholder="********" required />
        </div>

        <button type="submit" class="cta-btn secondary">계정 생성</button>
      </form>

      <div class="footer-link">
        이미 계정이 있으신가요? <NuxtLink to="/login">로그인</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { register } = useAuth();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
      alert("Passwords do not match");
      return;
  }
  register(username.value, password.value, username.value);
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
  background: radial-gradient(circle at 40% 50%, #1a1a3a 0%, #000 100%);
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
  color: #ff4d4d;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(255, 77, 77, 0.4);
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
  border-color: #ff4d4d;
  outline: none;
  box-shadow: 0 0 10px rgba(255, 77, 77, 0.2);
  background: rgba(255, 77, 77, 0.1);
}

.cta-btn {
  width: 100%;
  padding: 1rem;
  background: #ff4d4d;
  color: white;
  border: none;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 77, 77, 0.3);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(255, 77, 77, 0.5);
}

.footer-link {
  text-align: center;
  margin-top: 2rem;
  color: #666;
}

.footer-link a {
  color: #ff4d4d;
  text-decoration: none;
  font-weight: bold;
}

.footer-link a:hover {
  text-decoration: underline;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
    max-width: 100%;
  }
  
  .glitch-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  .input-group {
    margin-bottom: 1rem;
  }
  
  .input-group input {
    padding: 0.8rem;
  }
  
  .cta-btn {
    padding: 0.8rem;
    font-size: 1rem;
  }
  
  .footer-link {
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }
}
</style>
