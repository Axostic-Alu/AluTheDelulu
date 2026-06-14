import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# 1. Improve cursor tracking - increase lerp values for tighter response
# Core tracking lerp 0.4 -> 0.55
content = content.replace(
    "cursorRef.current.x += dx * 0.4;\n      cursorRef.current.y += dy * 0.4;",
    "cursorRef.current.x += dx * 0.55;\n      cursorRef.current.y += dy * 0.55;"
)

# Overshoot correction threshold 30 -> 40 (kicks in earlier, tighter feel)
content = content.replace(
    "const closeX = Math.abs(dx) < 30;\n      const closeY = Math.abs(dy) < 30;",
    "const closeX = Math.abs(dx) < 40;\n      const closeY = Math.abs(dy) < 40;"
)

# Overshoot correction amount 0.3 -> 0.4
content = content.replace(
    "if (closeX) cursorRef.current.x += dx * 0.3;  // stronger correction when close\n      if (closeY) cursorRef.current.y += dy * 0.3;",
    "if (closeX) cursorRef.current.x += dx * 0.4;  // stronger correction when close\n      if (closeY) cursorRef.current.y += dy * 0.4;"
)

# Snap threshold 5 -> 8
content = content.replace(
    "if (Math.abs(dx) < 5) cursorRef.current.x = targetRef.current.x;\n      if (Math.abs(dy) < 5) cursorRef.current.y = targetRef.current.y;",
    "if (Math.abs(dx) < 8) cursorRef.current.x = targetRef.current.x;\n      if (Math.abs(dy) < 8) cursorRef.current.y = targetRef.current.y;"
)

# Glow lerp 0.18 -> 0.25 (tighter glow tracking)
content = content.replace(
    "glowRef.current.x += gdx * 0.18;\n      glowRef.current.y += gdy * 0.18;",
    "glowRef.current.x += gdx * 0.25;\n      glowRef.current.y += gdy * 0.25;"
)

# Glow velocity 0.06 -> 0.10
content = content.replace(
    "glowRef.current.x += (cursorRef.current.x - glowRef.current.x) * 0.06;\n      glowRef.current.y += (cursorRef.current.y - glowRef.current.y) * 0.06;",
    "glowRef.current.x += (cursorRef.current.x - glowRef.current.x) * 0.10;\n      glowRef.current.y += (cursorRef.current.y - glowRef.current.y) * 0.10;"
)

# 2. Make section badges pulse on hover (already has whileHover, but let's add pulse animation class)
# Replace SectionBadge to add a subtle pulse animation
old_badge = '''<motion.div
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]"
      whileHover={{ scale: 1.05, borderColor: "rgba(108, 92, 231, 0.3)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >'''
new_badge = '''<motion.div
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]"
      whileHover={{ scale: 1.08, borderColor: "rgba(108, 92, 231, 0.4)", boxShadow: "0 0 20px rgba(108,92,231,0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      whileTap={{ scale: 0.95 }}
    >'''
content = content.replace(old_badge, new_badge)

# 3. Add stagger entrance to the stat section - already has stagger via index, let's add a container animation
# Add entrance animation wrapper to stats grid container
old_stats_container = '''<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {['''
new_stats_container = '''<motion.div 
              className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {['''
content = content.replace(old_stats_container, new_stats_container)

# Close the motion.div properly - find the closing div after the stats mapping
# The stats section ends with `</div>` before the `</Section>` for stats
# Let me find a unique pattern to close the motion.div
old_stats_end = '''            ].map((stat, i) => (
              <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} suffix={stat.suffix} prefix={stat.prefix} accentColor={stat.color} index={i} />
            ))}
          </div>'''
new_stats_end = '''            ].map((stat, i) => (
              <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} suffix={stat.suffix} prefix={stat.prefix} accentColor={stat.color} index={i} />
            ))}
          </motion.div>'''
content = content.replace(old_stats_end, new_stats_end)

# 4. Add more animation to the about section interests - add entrance to the grid itself
old_interests_grid = '''<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">'''
new_interests_grid = '''<motion.div 
              className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >'''
content = content.replace(old_interests_grid, new_interests_grid)

# Close the motion.div for interests
old_interests_close = '''            </div>'''
# Find the right closing div for interests - it's before the closing of the main about motion.div
# The pattern is: after all interests items, there's </div> for the interests grid, then </div> for the main about content
# Let me find a unique pattern
old_interests_end = '''                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>'''
new_interests_end = '''                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>'''
content = content.replace(old_interests_end, new_interests_end)

# 5. Make the scroll down arrow pulse more noticeably
old_scroll_arrow = '''<motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={14} className="text-[var(--color-text-muted)]" />
            </motion.div>'''
new_scroll_arrow = '''<motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.5 }}
            >
              <ArrowDown size={14} className="text-[var(--color-text-muted)]" />
            </motion.div>'''
content = content.replace(old_scroll_arrow, new_scroll_arrow)

# 6. Add entrance animation to the game marquee
old_marquee = '''<div className="relative -mt-16 mb-8">
        <GameMarquee />
      </div>'''
new_marquee = '''<motion.div 
          className="relative -mt-16 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
        <GameMarquee />
      </motion.div>'''
content = content.replace(old_marquee, new_marquee)

# 7. Add more visual feedback to stat cards on hover - already has good animations
# Let's add a pulse to the hero section badges

# 8. Make FloatingParticles more reactive - the particles drift towards cursor
# This needs component modification inside FloatingParticles
# Add a magnetic effect to particles based on mouse position
old_particles_map_start = '''{particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"'''
new_particles_map_start = '''{particles.map((p) => {
          // Calculate magnetic offset towards cursor
          const magnetX = (mouse.x - 0.5) * p.size * 3;
          const magnetY = (mouse.y - 0.5) * p.size * 2;
          return (
        <motion.div
          key={p.id}
          className="absolute rounded-full"'''
content = content.replace(old_particles_map_start, new_particles_map_start)

# Now close the particle map's new arrow function
# Find the closing of particle transition and add the closing brace
old_particle_end = '''          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}'''
new_particle_end = '''          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );})}'''
content = content.replace(old_particle_end, new_particle_end)

# 9. Improve the hero parallax effect - make it more dramatic
old_hero_parallax1 = '''<motion.div
          className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/5 blur-[150px]"
          style={{ y: heroParallax }}
        />'''
new_hero_parallax1 = '''<motion.div
          className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/5 blur-[150px]"
          style={{ y: heroParallax, x: useTransform(useScroll().scrollY, [0, 1000], [0, -30]) }}
        />'''
content = content.replace(old_hero_parallax1, new_hero_parallax1)

with open("src/app/page.tsx", "w") as f:
    f.write(content)

print("Changes applied successfully")
