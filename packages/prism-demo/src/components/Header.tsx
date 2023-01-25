/* This example requires Tailwind CSS v2.0+ */
import { Popover } from '@headlessui/react'

export default function Header() {
  return (
    <Popover className='relative bg-white'>
      <div className='absolute inset-0 shadow z-30 pointer-events-none' aria-hidden='true' />
      <div className='relative z-20'>
        <div className='max-w-7xl mx-auto flex justify-between items-center px-4 py-5 sm:px-6 sm:py-4 lg:px-8 md:justify-start md:space-x-10'>
          <div>
            <a href='#' className='flex'>
              <span className='sr-only'>Workflow</span>
              <img
                className='h-14 w-auto sm:h-14'
                src='https://www.sherwin-williams.com/content/experience-fragments/sherwin/tag/aem-main/language-masters/en/site/global_gateway/global-gateway/master.coreimg.png/structure/jcr%3acontent/root/container_1596074899/container_457167789/navigation/1623788533086/sw-logo-header-up.png'
                alt=''
              />
            </a>
          </div>
          <div className='hidden md:flex-1 md:flex md:items-center md:justify-between'>
            <Popover.Group as='nav' className='flex space-x-10'>
              <a href='#' className='text-base font-medium text-gray-500 hover:text-gray-900'>
                Paints & Supplies
              </a>
              <a href='#' className='text-base font-medium text-gray-500 hover:text-gray-900'>
                Color
              </a>
              <a href='#' className='text-base font-medium text-gray-500 hover:text-gray-900'>
                Inspiration
              </a>
              <a href='#' className='text-base font-medium text-gray-500 hover:text-gray-900'>
                How To
              </a>
            </Popover.Group>
          </div>
        </div>
      </div>
    </Popover>
  )
}
