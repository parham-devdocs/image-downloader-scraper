'use client' // Ensure this is a Client Component

import { joinGroup } from '@/app/actions/groups'

const JoinButton = ({ groupId, loadData }: { groupId: string, loadData: () => void }) => {
  async function join() {
    try {
      const response = await joinGroup(groupId)
      if (response?.status === 201) {
        loadData()
      }
      loadData()
    } catch (error) {
      console.error("Failed to join group:", error)

    }
  }

  return (
    <div className=' w-full h-fit px-6 py-3 bg-transparent'>
            <button
      onClick={join}
      type="button"
      className="w-full h-12 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white rounded-md border border-violet-600/50 backdrop-blur-sm px-4 py-2 font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center"
    >
      Join group
    </button>
    </div>

  )
}

export default JoinButton
