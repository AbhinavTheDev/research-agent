import { Link } from '@tanstack/react-router'
import { motion } from "motion/react"
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

export function NotFound({ children }: { children?: any }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-primary/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center text-center max-w-lg mx-auto"
      >

        <motion.h1
          className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/50 mb-2"
          initial={{ letterSpacing: "-0.1em", opacity: 0 }}
          animate={{ letterSpacing: "-0.05em", opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl font-bold mb-4 text-foreground/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page Not Found
        </motion.h2>

        <motion.div
          className="text-muted-foreground mb-8 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {children || "The page you are looking for doesn't exist or has been moved."}
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>

          <Button
            asChild
            size="lg"
            className="group"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}