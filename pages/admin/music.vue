<template>
  <div class="admin-panel">
    <div class="header">
      <h1>🎵 음악 관리 패널</h1>
      <p class="subtitle">localhost 전용 - 음악 요청 승인 및 관리</p>
    </div>

    <div class="filters">
      <button 
        v-for="status in ['all', 'pending', 'approved', 'rejected']" 
        :key="status"
        :class="{ active: currentFilter === status }"
        @click="currentFilter = status; fetchRequests()"
      >
        {{ status === 'all' ? '전체' : status === 'pending' ? '대기중' : status === 'approved' ? '승인됨' : '거절됨' }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>

    <div v-else-if="error" class="error-box">
      <h3>⚠️ 오류</h3>
      <p>{{ error }}</p>
      <button @click="fetchRequests">다시 시도</button>
    </div>

    <div v-else-if="requests.length === 0" class="empty-state">
      <p>{{ currentFilter === 'all' ? '음악 요청이 없습니다.' : `${currentFilter} 상태의 요청이 없습니다.` }}</p>
    </div>

    <div v-else class="requests-list">
      <div v-for="request in requests" :key="request._id" class="request-card">
        <div class="request-header">
          <div class="request-info">
            <h3>{{ request.title || '제목 없음' }}</h3>
            <p class="filename">{{ request.filename }}</p>
            <p class="hash">Hash: {{ request.hash.substring(0, 16) }}...</p>
          </div>
          <div :class="['status-badge', request.status]">
            {{ request.status === 'pending' ? '⏳ 대기중' : request.status === 'approved' ? '✅ 승인됨' : '❌ 거절됨' }}
          </div>
        </div>

        <div class="request-details">
          <div class="detail-item">
            <span class="label">요청자:</span>
            <span>{{ request.requestedByName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">요청일:</span>
            <span>{{ formatDate(request.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">BPM:</span>
            <span>{{ request.bpm || 120 }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Measure Length:</span>
            <span>{{ request.measureLength || 2.0 }}</span>
          </div>
          <div v-if="request.processedAt" class="detail-item">
            <span class="label">처리일:</span>
            <span>{{ formatDate(request.processedAt) }}</span>
          </div>
        </div>

        <div v-if="request.status === 'pending'" class="actions">
          <button 
            class="approve-btn" 
            @click="processRequest(request._id, 'approve')"
            :disabled="processing"
          >
            ✅ 승인
          </button>
          <button 
            class="reject-btn" 
            @click="processRequest(request._id, 'reject')"
            :disabled="processing"
          >
            ❌ 거절
          </button>
        </div>

        <div v-else class="processed-info">
          처리 완료
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const requests = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const processing = ref(false)
const currentFilter = ref('all')

const fetchRequests = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const query = currentFilter.value === 'all' ? '' : `?status=${currentFilter.value}`
    const response = await $fetch(`/api/admin/music-requests${query}`)
    requests.value = response as any[]
  } catch (err: any) {
    console.error('Failed to fetch music requests:', err)
    error.value = err.message || '음악 요청을 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const processRequest = async (requestId: string, action: 'approve' | 'reject') => {
  if (!confirm(`정말로 이 요청을 ${action === 'approve' ? '승인' : '거절'}하시겠습니까?`)) {
    return
  }

  processing.value = true
  
  try {
    await $fetch('/api/admin/music-requests', {
      method: 'POST',
      body: {
        requestId,
        action,
        adminUserId: null // TODO: Add actual admin user ID if needed
      }
    })
    
    // Refresh the list
    await fetchRequests()
    
    alert(`요청이 ${action === 'approve' ? '승인' : '거절'}되었습니다.`)
  } catch (err: any) {
    console.error('Failed to process request:', err)
    alert(`처리 실패: ${err.message || '알 수 없는 오류'}`)
  } finally {
    processing.value = false
  }
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('ko-KR')
}

onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filters button {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.filters button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.filters button.active {
  background: white;
  color: #667eea;
  border-color: white;
}

.loading {
  text-align: center;
  color: white;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-box {
  background: rgba(255, 59, 48, 0.9);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.error-box button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #ff3b30;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.error-box button:hover {
  transform: scale(1.05);
}

.empty-state {
  text-align: center;
  color: white;
  padding: 3rem;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.requests-list {
  display: grid;
  gap: 1.5rem;
}

.request-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.request-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.request-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.filename {
  font-family: monospace;
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.hash {
  font-family: monospace;
  color: #999;
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.status-badge.pending {
  background: #ffeaa7;
  color: #fdcb6e;
}

.status-badge.approved {
  background: #d4edda;
  color: #28a745;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #dc3545;
}

.request-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

.actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.approve-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.approve-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.reject-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.reject-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.processed-info {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  color: #666;
  font-weight: 600;
  margin-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .request-header {
    flex-direction: column;
    gap: 1rem;
  }

  .status-badge {
    align-self: flex-start;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
