import React from 'react'
import { FaGithub, FaTiktok } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Roasting HP. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://github.com/ifalfahri" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <FaGithub size={24} />
            </a>
            <a href="https://twitter.com/ifalfahri" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <FaTiktok size={24} />
            </a>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Created by{" "}
            <a
              href="https://github.com/ifalfahri"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ifalfahri
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer