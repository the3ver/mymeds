<script setup>
import { computed } from 'vue';

const props = defineProps({
  shape: {
    type: String,
    default: 'letter',
  },
  pillSize: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
  },
  color: {
    type: String,
    default: 'blue',
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: [Number, String],
    default: 40,
  },
});

const colorMap = {
  red: '#E53935',
  pink: '#D81B60',
  purple: '#8E24AA',
  indigo: '#3949AB',
  blue: '#1E88E5',
  cyan: '#00ACC1',
  teal: '#00897B',
  green: '#43A047',
  amber: '#FFB300',
  orange: '#FB8C00',
  'deep-orange': '#F4511E',
  'blue-grey': '#546E7A',
  white: '#FFFFFF',
};

const resolvedColor = computed(() => {
  const c = props.color || 'blue';
  return colorMap[c] || c;
});

const isWhite = computed(() => {
  const c = String(props.color || '').toLowerCase();
  return c === 'white' || resolvedColor.value.toUpperCase() === '#FFFFFF';
});

const strokeColor = computed(() => {
  if (isWhite.value) return '#94A3B8';
  return 'rgba(0, 0, 0, 0.25)';
});

const scoreColor = computed(() => {
  if (isWhite.value) return '#94A3B8';
  return 'rgba(255, 255, 255, 0.6)';
});

const scaleStyle = computed(() => {
  let scale = 0.85;
  if (props.pillSize === 'small') scale = 0.65;
  else if (props.pillSize === 'large') scale = 1.0;
  return {
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
  };
});

const letter = computed(() => {
  return (props.name || '').charAt(0).toUpperCase();
});

const isPill = computed(() => {
  return props.shape && props.shape !== 'letter';
});
</script>

<template>
  <div
    class="pill-avatar-container"
    :class="{
      'pill-avatar--pill': isPill,
      'pill-avatar--letter': !isPill,
      'pill-avatar--white': isWhite,
    }"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: !isPill ? resolvedColor : undefined,
    }"
  >
    <!-- Letter Mode -->
    <span
      v-if="!isPill"
      class="pill-avatar-letter font-weight-bold"
      :class="{ 'text-grey-darken-4': isWhite, 'text-white': !isWhite }"
      :style="{ fontSize: `${Number(size) * 0.5}px` }"
    >
      {{ letter }}
    </span>

    <!-- Pill Shape SVG Mode -->
    <svg
      v-else
      class="pill-avatar-svg"
      viewBox="0 0 40 40"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <g class="pill-graphic-scaled" :style="scaleStyle">
        <!-- 1. Round -->
        <g v-if="shape === 'round'" data-shape="round">
          <circle cx="20" cy="20" r="14" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <ellipse cx="17" cy="14" rx="7" ry="3.5" fill="white" fill-opacity="0.3" />
        </g>

        <!-- 2. Round with Score -->
        <g v-else-if="shape === 'round-score'" data-shape="round-score">
          <circle cx="20" cy="20" r="14" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <line class="pill-score-line" x1="20" y1="7" x2="20" y2="33" :stroke="scoreColor" stroke-width="1.8" stroke-linecap="round" />
          <ellipse cx="16" cy="13" rx="5" ry="2.5" fill="white" fill-opacity="0.3" />
        </g>

        <!-- 3. Round with Cross Score -->
        <g v-else-if="shape === 'round-cross'" data-shape="round-cross">
          <circle cx="20" cy="20" r="14" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <line class="pill-score-line" x1="20" y1="7" x2="20" y2="33" :stroke="scoreColor" stroke-width="1.8" stroke-linecap="round" />
          <line class="pill-score-line" x1="7" y1="20" x2="33" y2="20" :stroke="scoreColor" stroke-width="1.8" stroke-linecap="round" />
        </g>

        <!-- 4. Capsule (Dual Color Smart-Default) -->
        <g v-else-if="shape === 'capsule'" data-shape="capsule">
          <!-- Top Cap -->
          <path
            class="capsule-cap"
            d="M 13,20 L 13,13 A 7,7 0 0,1 27,13 L 27,20 Z"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
          />
          <!-- Bottom Body -->
          <path
            class="capsule-body"
            d="M 13,20 L 13,27 A 7,7 0 0,0 27,27 L 27,20 Z"
            :fill="isWhite ? '#FFFFFF' : '#F8FAFC'"
            :stroke="strokeColor"
            stroke-width="1.5"
          />
          <!-- Joint ring -->
          <line x1="12.5" y1="20" x2="27.5" y2="20" stroke="rgba(0,0,0,0.3)" stroke-width="1.2" />
          <!-- Specular reflection -->
          <path d="M 15,10 A 5,5 0 0,1 18,7 L 18,25 A 5,5 0 0,1 15,22 Z" fill="white" fill-opacity="0.25" />
        </g>

        <!-- 5. Oblong -->
        <g v-else-if="shape === 'oblong'" data-shape="oblong">
          <rect x="7" y="13" width="26" height="14" rx="7" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <ellipse cx="20" cy="16" rx="9" ry="2" fill="white" fill-opacity="0.3" />
        </g>

        <!-- 6. Oblong with Score -->
        <g v-else-if="shape === 'oblong-score'" data-shape="oblong-score">
          <rect x="7" y="13" width="26" height="14" rx="7" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <line class="pill-score-line" x1="20" y1="13.5" x2="20" y2="26.5" :stroke="scoreColor" stroke-width="1.8" stroke-linecap="round" />
        </g>

        <!-- 7. Oval -->
        <g v-else-if="shape === 'oval'" data-shape="oval">
          <ellipse cx="20" cy="20" rx="15" ry="10" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <ellipse cx="18" cy="16" rx="8" ry="3" fill="white" fill-opacity="0.3" />
        </g>

        <!-- 8. Heart -->
        <g v-else-if="shape === 'heart'" data-shape="heart">
          <path
            d="M 20,33 C 12,25 6,19 6,13 C 6,8.5 9.5,5 14,5 C 16.5,5 18.8,6.5 20,8.8 C 21.2,6.5 23.5,5 26,5 C 30.5,5 34,8.5 34,13 C 34,19 28,25 20,33 Z"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
          />
        </g>

        <!-- 9. Diamond / Raute -->
        <g v-else-if="shape === 'diamond'" data-shape="diamond">
          <polygon
            points="20,6 34,20 20,34 6,20"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <line class="pill-score-line" x1="20" y1="9" x2="20" y2="31" :stroke="scoreColor" stroke-width="1.5" />
        </g>

        <!-- 10. Triangle -->
        <g v-else-if="shape === 'triangle'" data-shape="triangle">
          <polygon
            points="20,7 34,31 6,31"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </g>

        <!-- 11. Hexagon -->
        <g v-else-if="shape === 'hexagon'" data-shape="hexagon">
          <polygon
            points="20,6 32,13 32,27 20,34 8,27 8,13"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </g>

        <!-- 12. Square -->
        <g v-else-if="shape === 'square'" data-shape="square">
          <rect x="8" y="8" width="24" height="24" rx="4" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
        </g>

        <!-- 13. Drop -->
        <g v-else-if="shape === 'drop'" data-shape="drop">
          <path
            d="M 20,6 C 20,6 32,20 32,26 C 32,32.5 26.5,35 20,35 C 13.5,35 8,32.5 8,26 C 8,20 20,6 20,6 Z"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
          />
          <ellipse cx="17" cy="24" rx="3" ry="5" fill="white" fill-opacity="0.3" transform="rotate(-20 17 24)" />
        </g>

        <!-- 14. Syringe / Pen -->
        <g v-else-if="shape === 'syringe'" data-shape="syringe">
          <rect x="16" y="11" width="8" height="18" rx="1.5" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.2" />
          <line x1="20" y1="5" x2="20" y2="11" :stroke="strokeColor" stroke-width="1.5" />
          <line x1="14" y1="29" x2="26" y2="29" :stroke="strokeColor" stroke-width="2" />
          <rect x="18" y="29" width="4" height="6" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1" />
          <line x1="16" y1="35" x2="24" y2="35" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
        </g>

        <!-- 15. Inhaler / Spray -->
        <g v-else-if="shape === 'inhaler'" data-shape="inhaler">
          <path
            d="M 12,7 L 22,7 L 22,23 L 30,23 L 30,31 L 18,31 C 14.5,31 12,28.5 12,25 Z"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <rect x="14" y="5" width="6" height="2" :fill="strokeColor" />
        </g>

        <!-- 16. Tube / Cream -->
        <g v-else-if="shape === 'tube'" data-shape="tube">
          <path
            d="M 14,8 L 26,8 L 24,28 L 16,28 Z"
            :fill="resolvedColor"
            :stroke="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <rect x="17" y="28" width="6" height="5" rx="1" :fill="isWhite ? '#CBD5E1' : '#FFFFFF'" :stroke="strokeColor" stroke-width="1.2" />
          <line x1="13" y1="8" x2="27" y2="8" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
        </g>

        <!-- 17. Patch -->
        <g v-else-if="shape === 'patch'" data-shape="patch">
          <rect x="7" y="7" width="26" height="26" rx="5" :fill="isWhite ? '#F8FAFC' : resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
          <rect x="12" y="12" width="16" height="16" rx="2" fill="white" fill-opacity="0.5" stroke="rgba(0,0,0,0.2)" stroke-width="1" stroke-dasharray="2,2" />
        </g>

        <!-- Fallback if unknown shape -->
        <g v-else data-shape="round">
          <circle cx="20" cy="20" r="14" :fill="resolvedColor" :stroke="strokeColor" stroke-width="1.5" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.pill-avatar-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  user-select: none;
  flex-shrink: 0;
}

.pill-avatar--pill {
  background-color: rgba(125, 125, 125, 0.12);
  border: 1px solid rgba(125, 125, 125, 0.2);
}

.pill-avatar--white.pill-avatar--letter {
  border: 1.5px solid #cbd5e1;
  background-color: #ffffff !important;
}

.pill-avatar-svg {
  display: block;
}

.pill-avatar-letter {
  line-height: 1;
}
</style>
