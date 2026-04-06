import { useState } from 'react'
import { Box, Collapse, Paper, Slider, Typography } from '@mui/material'
import { useSceneSettings } from '../context/SceneContext'

// ── reusable slider row ──────────────────────────────────────────────────────
function Row({
  label, value, min, max, step, decimals = 2,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  decimals?: number
  onChange: (v: number) => void
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '-4px' }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontSize: 10 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.4, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>
          {value.toFixed(decimals)}
        </Typography>
      </Box>
      <Slider
        size="small"
        value={value}
        min={min} max={max} step={step}
        onChange={(_, v) => onChange(v as number)}
        sx={{
          py: '6px',
          '& .MuiSlider-thumb': { width: 10, height: 10 },
          '& .MuiSlider-rail':  { opacity: 0.2 },
        }}
      />
    </Box>
  )
}

// ── divider ──────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <Typography
      variant="caption"
      sx={{ opacity: 0.35, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', mt: 0.5 }}
    >
      {label}
    </Typography>
  )
}

// ── main panel ───────────────────────────────────────────────────────────────
export function ControlPanel() {
  const [open, setOpen] = useState(true)
  const { intensity, exposure, rotX, rotY, rotZ, bgColor, set } = useSceneSettings()

  return (
    <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 100, width: 220 }}>
      <Paper
        elevation={3}
        sx={{ borderRadius: '10px', overflow: 'hidden', backdropFilter: 'blur(8px)',
              bgcolor: 'rgba(255,255,255,0.82)' }}
      >
        {/* header */}
        <Box
          onClick={() => setOpen(o => !o)}
          sx={{
            px: 2, py: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', userSelect: 'none',
            bgcolor: 'rgba(0,0,0,0.03)',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.7 }}>
            SCENE
          </Typography>
          <Typography sx={{ fontSize: 10, opacity: 0.4 }}>{open ? '▲' : '▼'}</Typography>
        </Box>

        <Collapse in={open}>
          <Box sx={{ px: 2, pt: 1, pb: 1.5, display: 'flex', flexDirection: 'column', gap: '2px' }}>

            {/* HDRI */}
            <Divider label="HDRI" />
            <Row label="Intensity"  value={intensity} min={0} max={3}    step={0.01} onChange={v => set({ intensity: v })} />
            <Row label="Exposure"   value={exposure}  min={0} max={3}    step={0.01} onChange={v => set({ exposure: v })} />

            {/* Rotation */}
            <Divider label="Rotation" />
            <Row label="Rot X"  value={rotX} min={-180} max={180} step={1} decimals={0} onChange={v => set({ rotX: v })} />
            <Row label="Rot Y"  value={rotY} min={-180} max={180} step={1} decimals={0} onChange={v => set({ rotY: v })} />
            <Row label="Rot Z"  value={rotZ} min={-180} max={180} step={1} decimals={0} onChange={v => set({ rotZ: v })} />

            {/* Background */}
            <Divider label="Background" />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '4px' }}>
              <Typography variant="caption" sx={{ opacity: 0.6, fontSize: 10 }}>Color</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.35, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>
                  {bgColor}
                </Typography>
                <Box
                  component="input"
                  type="color"
                  value={bgColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ bgColor: e.target.value })}
                  sx={{
                    width: 28, height: 20, p: 0, border: 'none', borderRadius: '4px',
                    cursor: 'pointer', bgcolor: 'transparent',
                  }}
                />
              </Box>
            </Box>

          </Box>
        </Collapse>
      </Paper>
    </Box>
  )
}
