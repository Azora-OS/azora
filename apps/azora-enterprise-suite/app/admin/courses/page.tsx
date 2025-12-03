<main className="ml-64 p-8">
    <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <div className="flex gap-2">
            <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
                <span>🤖</span> Generate with AI
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Create Manually
            </button>
        </div>
    </div>

    {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] p-8 rounded-xl max-w-2xl w-full border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Generate Course with Elara AI</h2>
                <p className="text-blue-200 mb-6">
                    Elara will automatically generate lesson scripts, code examples, exercises, and quizzes for your course.
                </p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Course Title</label>
                        <input
                            type="text"
                            defaultValue="Introduction to Python"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Level</label>
                            <select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                                <option>Programming</option>
                                <option>Design</option>
                                <option>Business</option>
                                <option>Marketing</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleGenerateCourse}
                        disabled={generating}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {generating ? 'Generating...' : 'Generate Course'}
                    </button>
                    <button
                        onClick={() => setShowGenerateModal(false)}
                        className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
            { title: 'Intro to Python', students: 156, revenue: '$7,800', status: 'Published' },
            { title: 'Web Dev Bootcamp', students: 89, revenue: '$8,900', status: 'Published' },
            { title: 'Data Science', students: 45, revenue: '$3,600', status: 'Draft' },
            { title: 'React Patterns', students: 230, revenue: '$13,800', status: 'Published' },
            { title: 'UI/UX Design', students: 12, revenue: '$840', status: 'Archived' },
        ].map((course, i) => (
            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                        📚
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${course.status === 'Published' ? 'bg-green-500/20 text-green-300' :
                        course.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                        }`}>
                        {course.status}
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-2">{course.title}</h3>

                <div className="flex justify-between text-sm text-blue-200 mb-4">
                    <span>{course.students} Students</span>
                    <span>{course.revenue}</span>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-sm">
                        Edit
                    </button>
                    <button className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-sm">
                        Analytics
                    </button>
                </div>
            </div>
        ))}
    </div>
</main>
        </div >
    );
}
