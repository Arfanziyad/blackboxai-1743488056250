import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import AttendanceChart from '../components/AttendanceChart'
import TimetableUpload from '../components/TimetableUpload'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const res = await fetch('/api/attendance')
        const data = await res.json()
        setAttendanceData(data)
      } catch (error) {
        console.error('Error fetching attendance data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchAttendanceData()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Dashboard | Attendance System</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
            <button
              onClick={() => signOut()}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Attendance Overview Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-1">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Overall Attendance
                  </h3>
                  <div className="mt-2 text-3xl font-semibold text-blue-600">
                    {attendanceData.overallPercentage || 0}%
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">
                      {attendanceData.presentClasses || 0} of {attendanceData.totalClasses || 0} classes attended
                    </span>
                  </div>
                </div>
              </div>

              {/* Timetable Upload Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
                <div className="px-4 py-5 sm:p-6">
                  <TimetableUpload />
                </div>
              </div>
            </div>

            {/* Attendance Chart Section */}
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Attendance Trends
                </h3>
                <div className="mt-4 h-64">
                  <AttendanceChart data={attendanceData.bySubject || []} />
                </div>
              </div>
            </div>

            {/* Subjects List */}
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Subjects
                </h3>
                <div className="mt-4">
                  {attendanceData.bySubject?.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {attendanceData.bySubject.map((subject) => (
                        <li key={subject.name} className="py-4 flex justify-between">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {subject.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {subject.present} of {subject.total} classes
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            <span className={subject.percentage >= 75 ? 'text-green-600' : 'text-red-600'}>
                              {subject.percentage}%
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No subjects found. Upload your timetable to get started.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}