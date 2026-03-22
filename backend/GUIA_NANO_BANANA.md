# GUIA COMPLETO — ISABELLEX NO NANO BANANA
## Geração de imagens ultra realistas v1.0

---

## 1. CONFIGURAÇÕES BASE
- **Model**: Hyper Realism Pro ou mais recente
- **Aspect ratio**: Feed 4:5 | Stories 9:16 | Carrossel 1:1
- **Steps**: Máximo disponível
- **CFG Scale**: 4-6 (mais baixo = mais natural)
- **Seed**: SEMPRE salvar quando resultado ficar bom
- **Reference image**: SEMPRE subir rosto base (3 ângulos)
- **Negative prompt**: SEMPRE incluir

---

## 2. ÂNCORAS FIXAS DO PERSONAGEM
> Usar em TODOS os prompts sem exceção

### Rosto e Features:
- blue-grey pale iris eyes, cool, striking
- dark thick strongly defined eyebrows, natural high arch, individual hairs visible
- scattered dark freckles across nose bridge and upper cheeks, organic, irregular, not symmetrical
- long straight jet-black hair, center part
- thin gold chain necklace at collarbone with small charm pendant
- small gold hoop earrings
- natural facial asymmetry, left and right sides never perfectly mirrored
- no filter, no smoothing, no retouching, matte skin texture
- visible pores, hyperrealistic skin

### Estrutura Óssea:
- oval-elongated face
- high prominent cheekbones
- slightly angular jaw tapering to softly pointed chin
- long elegant neck
- defined collarbones

---

## 3. TEMPLATE MASTER DE PROMPT

```
[ÂNGULO + DISTÂNCIA], young Brazilian woman, 23-25 years old, slim build, long elegant neck, defined collarbones, oval-elongated face, high prominent cheekbones, slightly angular jaw, softly pointed chin, natural facial asymmetry. Blue-grey pale cool iris eyes, deep-set slightly hooded lids, iris fiber texture visible, natural moisture film on eyeballs, [CATCHLIGHT DA LUZ]. Dark thick strongly defined eyebrows, natural high arch, individual hairs visible — her most expressive feature. Long straight jet-black hair, center part, [ESTADO DO CABELO], [HIGHLIGHT DO CABELO NA LUZ]. Scattered dark freckles across nose bridge and upper cheeks — organic, irregular, not symmetrical, permanent identifying mark. Visible pores varying sizes, larger around nose, finer at cheeks. Subsurface scattering at nose tip. Natural pink flush at cheeks. Soft vellus hairs along jaw catching light. Matte dry skin texture, zero filter, zero smoothing, zero retouching. Small gold hoop earrings catching light. Thin gold chain necklace at collarbone with small charm pendant. [ROUPA]. [EXPRESSÃO]. [LUZ]. [BACKGROUND]. Shot on 35mm film, slight grain, shallow depth of field. Hyperrealistic editorial portrait photography.
```

---

## 4. NEGATIVE PROMPT — USAR SEMPRE

```
smooth skin, airbrushed, plastic skin, poreless, perfect symmetry, glossy skin, heavy makeup, lipstick, overdone makeup, studio lighting only, white background, cartoon, illustration, 3D render, CGI, anime, deformed, ugly, blurry face, watermark, text, logo, oversaturated, overexposed face, unnatural colors, fake looking, artificial, digital art
```

---

## 5. BIBLIOTECA DE LUZES

### LUZ 1 — MANHÃ QUENTE (cama/acordando):
- Light: `soft warm golden morning window light from right side, diffused, low contrast, warm glow on right side of face, cooler shadow on left, temperature split across face`
- Catchlight: `warm golden catchlight upper-right quadrant each iris`
- Hair: `warm golden highlight on outermost right hair layer only`

### LUZ 2 — FRIA DRAMÁTICA (signature):
- Light: `cold blue-white directional light from left side, sharp, hard-edged shadow on right side, high contrast, moody`
- Catchlight: `cold blue-white catchlight upper-left quadrant each iris`
- Hair: `sharp blue-white highlight on outermost left hair layer only, right side in shadow`

### LUZ 3 — NEON ROXO/TECH:
- Light: `subtle cool purple-blue neon rim light from left, dark background, slight chromatic aberration at edges, moody digital atmosphere`
- Catchlight: `purple-tinted catchlight upper-left each iris`
- Hair: `subtle purple-blue highlight on hair left side`

### LUZ 4 — GOLDEN HOUR EXTERIOR:
- Light: `warm golden hour sunlight from left, soft directional, creating warm orange-gold glow on left side of face, blue sky ambient on right, strong warm rim on hair`
- Catchlight: `warm orange-gold catchlight upper-left each iris`
- Hair: `strong warm golden rim light on left hair, almost luminous`

### LUZ 5 — DIFUSA EDITORIAL CLEAN:
- Light: `soft diffused overcast natural light, even illumination, no hard shadows, cool white ambient, slight warmth on skin undertone`
- Catchlight: `soft white catchlight centered in each iris`
- Hair: `subtle cool highlight on top of hair only`

---

## 6. BIBLIOTECA DE ÂNGULOS

| Ângulo | Prompt |
|---|---|
| Close Extremo | `extreme close-up, filling frame from chin to eyebrows, face fills entire frame` |
| Close Rosto | `close-up portrait, face and neck visible, slight breathing room on sides` |
| Selfie na Cama | `selfie POV, arm extended toward camera, slightly above eye level, she looks up into lens` |
| Médio Busto | `medium close-up, upper chest to top of head, collarbone and necklace fully visible` |
| Editorial Meio | `medium shot, waist to top of head, environment visible around her` |
| Perfil 3/4 | `three-quarter profile, face turned slightly left, catching directional light` |
| Over Shoulder | `over the shoulder angle, slight downward tilt, intimate` |

---

## 7. BIBLIOTECA DE EXPRESSÕES

| Expressão | Prompt |
|---|---|
| Neutra (padrão) | `expression completely neutral, controlled, alive but not performing, not smiling, not frowning, direct gaze into camera` |
| Entediada | `slightly bored expression, lower eyelids slightly heavy, jaw micro-relaxed, mouth barely closed, gaze steady` |
| Micro-Smirk | `very subtle 1-2mm upturn at left corner of mouth only, not a smile, left brow raised 1mm, completely involuntary` |
| Pensativa | `thoughtful expression, gaze slightly defocused, lips relaxed and barely parted, brow slightly furrowed 1mm` |
| Manhã | `morning expression, slightly sleepy, lower lids relaxed, natural sleep-flush on cheeks, lips slightly more pigmented from warmth, not styled` |

---

## 8. BIBLIOTECA DE ROUPAS

| Roupa | Prompt |
|---|---|
| Casual Cama | `simple black fitted spaghetti strap top, sleep casual, no logos, collarbone visible` |
| Editorial Preto | `simple black fitted top, minimal, no logos, structured` |
| Tech/Editorial | `black mock-neck top, clean, minimal, collarbone covered` |
| Inverno Casual | `oversized dark grey or black knit sweater, slightly off-shoulder, casual` |
| Street Minimal | `black crop top, high-waisted dark jeans visible at bottom of frame` |

---

## 10. DICAS CRÍTICAS DE CONSISTÊNCIA

### O QUE MUDA ENTRE POSTS (só isso):
- Bloco de luz
- Ângulo/enquadramento
- Expressão
- Roupa
- Background

### O QUE NUNCA MUDA:
- Âncoras do personagem (seção 2)
- Negative prompt (seção 4)
- "no filter, no smoothing, no retouching"
- "scattered dark freckles, organic, irregular"
- "blue-grey pale iris"
- "dark thick defined brows, high arch"
- "natural facial asymmetry"

### QUANDO O ROSTO PERDER CONSISTÊNCIA:
1. Subir novamente a reference image
2. Aumentar o peso da reference (IP Adapter)
3. Adicionar: "exact same face as reference image"
4. Usar seed do melhor resultado anterior
5. Reduzir CFG Scale

### QUANDO A PELE FICAR PLÁSTICA:
Adicionar: `visible pores, skin texture, slight skin texture variation, natural skin imperfections, not airbrushed, film grain`

### QUANDO AS SARDAS SUMIREM:
Reforçar: `scattered dark freckles across nose bridge and upper cheeks, clearly visible, organic, irregular, multiple freckles, prominent freckles, not faint`
