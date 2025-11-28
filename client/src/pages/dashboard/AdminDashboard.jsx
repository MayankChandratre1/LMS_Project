import Chart, { ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip } from 'chart.js/auto'
import { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { FaUsers } from 'react-icons/fa'
import { FcSalesPerformance } from 'react-icons/fc'
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GiMoneyStack } from 'react-icons/gi'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';

import HomeLayout from '../../layouts/HomeLayout'
import { deleteCourse, getAllCourse } from '../../redux/slices/CourseSlice';
import { getPaymentsRecord } from '../../redux/slices/RazorpaySlice';
import { getStats } from '../../redux/slices/StatSlice';

Chart.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip)
function AdminDashboard() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { allUserCount, subscribedCount } = useSelector((state) => state.stat);
    const { allPayments, monthlySalesRecord } = useSelector((state) => state.razorpay);
    const Courses = useSelector((state) => state.course.courseData);

    const [query, setQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");

    const userData = {
        labels: ["Registered User", "Entrolled User"],
        datasets: [
            {
                label: "User details",
                data: [allUserCount, subscribedCount],
                backgroundColor: ["yellow", "green"],
                borderWidth: 1
            }
        ]
    }

    const salesData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Sales",
                data: monthlySalesRecord,
                pointBackgroundColor: ["rgb(255, 99, 132)"],
                borderWidth: 2,
            }
        ],
    }
    const userDataOptions = {
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    fontSize: 16
                }
            }
        }
    };
    const salesDataOptions = {
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    fontSize: 16,
                },
            },
        },
    };
    useEffect(() => {
        (
            async () => {
                await dispatch(getAllCourse());
                await dispatch(getStats());
                await dispatch(getPaymentsRecord())
            }
        )()
    }, [])

    async function onDelete(id) {
        const res = await dispatch(deleteCourse(id));
        if (res?.payload?.success) {
            await dispatch(getAllCourse())
        }
    }

    const onRowKeyDown = (e, course) => {
        if (e.key === "Enter") {
            navigate(`/course/${course?.title}/${course?._id}/lectures`, { state: course })
        }
    }

    return (
        <HomeLayout>
			<main aria-labelledby="admin-dashboard-heading" className="max-w-7xl mx-auto px-6 py-10 space-y-8">
				<header className="flex items-start justify-between gap-4">
					<div>
						<h1 id="admin-dashboard-heading" className="text-3xl font-bold text-white">Admin dashboard</h1>
						<p className="text-sm text-gray-400 mt-1">High-level view of platform activity and course management</p>
					</div>
					<div className="flex items-center gap-3">
						<Link to="/course/create" className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold shadow hover:opacity-95">Create course</Link>
					</div>
				</header>

				{/* Top area: left = charts, right = compact cards + controls */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* charts column (span 2) */}
					<div className="lg:col-span-2 space-y-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl p-5">
						<div className="flex flex-col lg:flex-row gap-6 items-stretch">
							<div className="flex-1 bg-black/40 rounded-xl p-4 border border-gray-700/60">
								<h2 className="text-sm text-gray-300 mb-2">Monthly sales</h2>
								<Line data={salesData} options={salesDataOptions} aria-label="Monthly sales line chart" />
							</div>
							<div className="w-72 bg-black/40 rounded-xl p-4 border border-gray-700/60">
								<h2 className="text-sm text-gray-300 mb-2">Users overview</h2>
								<figure>
									<figcaption className="sr-only">Registered vs enrolled users</figcaption>
									<Pie data={userData} options={userDataOptions} aria-label="User registration and enrolled users pie chart" />
								</figure>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-gradient-to-br from-blue-700/10 to-blue-900/10 rounded-lg p-4 border border-gray-700/40">
								<div className="text-xs text-gray-400">Total courses</div>
								<div className="text-2xl font-bold text-white mt-2">{Courses?.length || 0}</div>
								<div className="text-xs text-gray-400 mt-1">Active offerings</div>
							</div>
							<div className="bg-gradient-to-br from-green-700/10 to-green-900/10 rounded-lg p-4 border border-gray-700/40">
								<div className="text-xs text-gray-400">Subscribed users</div>
								<div className="text-2xl font-bold text-white mt-2">{subscribedCount}</div>
								<div className="text-xs text-gray-400 mt-1">Subscription conversions</div>
							</div>
							<div className="bg-gradient-to-br from-purple-700/10 to-purple-900/10 rounded-lg p-4 border border-gray-700/40">
								<div className="text-xs text-gray-400">Revenue</div>
								<div className="text-2xl font-bold text-white mt-2">{isNaN(allPayments?.count) ? 0 : allPayments.count * 499}</div>
								<div className="text-xs text-gray-400 mt-1">Estimated total</div>
							</div>
						</div>
					</div>

					{/* right column: quick actions + summary */}
					<aside className="space-y-6 rounded-2xl border border-gray-700/40 p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
						<div className="flex flex-col gap-3">
							<h3 className="text-sm text-gray-300 uppercase tracking-wide">Quick actions</h3>
							<div className="flex flex-col gap-2">
								<Link to="/course/create" className="w-full text-center px-3 py-2 bg-yellow-500 rounded-md text-black font-semibold">Create course</Link>
							</div>
						</div>

						<div className="border-t border-gray-700/30 pt-4 space-y-3">
							<h4 className="text-sm text-gray-300">Live summary</h4>
							<ul className="text-sm text-gray-400 space-y-2">
								<li>Total users: <span className="text-white ml-2 font-semibold">{allUserCount}</span></li>
								<li>Enrolled: <span className="text-white ml-2 font-semibold">{subscribedCount}</span></li>
								<li>Payments: <span className="text-white ml-2 font-semibold">{allPayments?.count || 0}</span></li>
							</ul>
						</div>
					</aside>
				</section>

				{/* COURSES TABLE SECTION — search + filters + table */}
				<section className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl p-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
						<div>
							<h2 className="text-lg font-semibold text-white">Course overview</h2>
							<p className="text-xs text-gray-400 mt-1">Manage courses, edit content and view stats</p>
						</div>
						<div className="flex gap-2 items-center">
							<input
								type="search"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search courses..."
								className="input input-sm bg-gray-700/40 text-white placeholder-gray-400 border border-gray-600"
								aria-label="Search courses"
							/>
							<select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select select-sm bg-gray-700/40 text-white border border-gray-600">
								<option value="">All categories</option>
								{/* small static options — you can map dynamic categories */ }
								<option value="Frontend Development">Frontend Development</option>
								<option value="Backend Development">Backend Development</option>
								<option value="Design">Design</option>
							</select>
							<button onClick={() => dispatch(getAllCourse())} className="btn btn-ghost">Refresh</button>
						</div>
					</div>

					<div className="overflow-x-auto rounded-lg bg-gradient-to-br from-gray-900/30 to-gray-900/10 border border-gray-700/30">
						<table className="table w-full text-left text-sm">
							<thead className="bg-gray-900/60 text-gray-300">
								<tr>
									<th className="px-4 py-3">#</th>
									<th className="px-4 py-3">Title</th>
									<th className="px-4 py-3 hidden lg:table-cell">Category</th>
									<th className="px-4 py-3">Instructor</th>
									<th className="px-4 py-3">Lectures</th>
									<th className="px-4 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{Courses?.filter(c => !categoryFilter || (c.category || '').includes(categoryFilter)).filter(c => !query || c.title.toLowerCase().includes(query.toLowerCase())).map((course, idx) => (
									<tr key={course._id} className="hover:bg-gray-800/40 even:bg-gray-900/20">
										<td className="px-4 py-3">{idx + 1}</td>
										<td className="px-4 py-3">
											<button onClick={() => navigate(`/course/${course.title}/${course._id}/lectures`, { state: course })} className="text-white hover:text-yellow-400">{course.title}</button>
										</td>
										<td className="px-4 py-3 hidden lg:table-cell">{course.category}</td>
										<td className="px-4 py-3">{course.createdBy}</td>
										<td className="px-4 py-3">{course.numberOfLectures}</td>
										<td className="px-4 py-3 text-right flex gap-2 justify-end">
											<button onClick={() => navigate(`/course/${course.title}/${course._id}/editCourse`, { state: course })} aria-label={`Edit ${course.title}`} className="px-2 py-1 bg-blue-600 rounded text-white">Edit</button>
											<button onClick={() => onDelete(course._id)} aria-label={`Delete ${course.title}`} className="px-2 py-1 bg-red-600 rounded text-white">Delete</button>
											<button onClick={() => navigate(`/course/${course.title}/${course._id}/quizes`, { state: course })} aria-label={`Manage quizzes for ${course.title}`} className="px-2 py-1 bg-yellow-500 rounded text-black">Quizzes</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
 			</main>
 		</HomeLayout>
 	)
 }
 
 export default AdminDashboard
